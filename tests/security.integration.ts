import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { newAttempt } from "../lib/assessment/engine";
import { items } from "../lib/assessment/items";
vi.mock("server-only", () => ({}));
import { GET, PUT, DELETE } from "../app/api/attempts/[id]/route";
import { DELETE as deleteAccount } from "../app/api/account/route";
import { admin } from "../lib/firebase/server";
const projectId = "demo-ruang-eq";
let env: RulesTestEnvironment,
  tokenA: string,
  tokenB: string,
  uidA: string,
  uidB: string;
const origin = "http://127.0.0.1:3000";
const request = (token: string, method: string, body?: unknown) =>
  new Request(`${origin}/api/attempts`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      origin,
      "content-type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
async function signup() {
  const res = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    },
  );
  return res.json();
}
beforeAll(async () => {
  process.env.FIREBASE_PROJECT_ID = projectId;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  process.env.APP_ORIGIN = origin;
  env = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  const a = await signup(),
    b = await signup();
  tokenA = a.idToken;
  uidA = a.localId;
  tokenB = b.idToken;
  uidB = b.localId;
});
afterAll(async () => {
  await env?.cleanup();
});
describe("real Auth + Firestore emulators", () => {
  it("owner-only reads; all client writes denied", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      setDoc(doc(c.firestore(), `users/${uidA}/attempts/fixture`), {
        status: "draft",
      }),
    );
    const a = env.authenticatedContext(uidA).firestore(),
      b = env.authenticatedContext(uidB).firestore();
    await assertSucceeds(getDoc(doc(a, `users/${uidA}/attempts/fixture`)));
    await assertFails(getDoc(doc(b, `users/${uidA}/attempts/fixture`)));
    await assertFails(
      getDoc(
        doc(
          env.unauthenticatedContext().firestore(),
          `users/${uidA}/attempts/fixture`,
        ),
      ),
    );
    await assertFails(setDoc(doc(a, `users/${uidA}/attempts/new`), {}));
    await assertFails(deleteDoc(doc(a, `users/${uidA}/attempts/fixture`)));
  });
  it("Admin routes isolate tenants, reject bad tokens/origins/payloads, detect conflicts and recompute idempotently", async () => {
    const a = newAttempt();
    expect(
      (await PUT(request("invalid", "PUT", { attempt: a }), ctx(a.id))).status,
    ).toBe(401);
    expect(
      (
        await PUT(
          new Request(origin, {
            method: "PUT",
            headers: {
              authorization: `Bearer ${tokenA}`,
              origin: "https://evil.example",
              "content-type": "application/json",
            },
            body: JSON.stringify({ attempt: a }),
          }),
          ctx(a.id),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await PUT(
          request(tokenA, "PUT", {
            attempt: { ...a, responsesByItemId: { bad: 8 } },
          }),
          ctx(a.id),
        )
      ).status,
    ).toBe(400);
    expect(
      (await PUT(request(tokenA, "PUT", { attempt: a }), ctx(a.id))).status,
    ).toBe(200);
    expect((await GET(request(tokenB, "GET"), ctx(a.id))).status).toBe(404);
    await DELETE(request(tokenB, "DELETE"), ctx(a.id));
    expect((await GET(request(tokenA, "GET"), ctx(a.id))).status).toBe(200);
    expect(
      (await PUT(request(tokenA, "PUT", { attempt: a }), ctx(a.id))).status,
    ).toBe(409);
    const completed = {
      ...a,
      revision: 1,
      status: "completed",
      completedAt: new Date().toISOString(),
      responsesByItemId: Object.fromEntries(
        items.map((i) => [i.id, i.reverse ? 1 : 5]),
      ),
    };
    const responses = await Promise.all([
      PUT(request(tokenA, "PUT", { attempt: completed, score: 0 }), ctx(a.id)),
      PUT(request(tokenA, "PUT", { attempt: completed, score: 0 }), ctx(a.id)),
    ]);
    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    const saved = await responses[0].json();
    expect(saved.resultSnapshot.summary).toBe(100);
    expect(saved.revision).toBe(2);
    expect(
      (
        await admin()
          .db.collection(`users/${uidA}/attempts`)
          .where("id", "==", a.id)
          .get()
      ).size,
    ).toBe(1);
    await DELETE(request(tokenA, "DELETE"), ctx(a.id));
    expect((await GET(request(tokenA, "GET"), ctx(a.id))).status).toBe(404);
  });
  it("deletes the account and every attempt document", async () => {
    const a = newAttempt();
    await PUT(request(tokenB, "PUT", { attempt: a }), ctx(a.id));
    expect((await deleteAccount(request(tokenB, "DELETE"))).status).toBe(200);
    expect(
      (await admin().db.collection(`users/${uidB}/attempts`).get()).empty,
    ).toBe(true);
    await expect(admin().auth.getUser(uidB)).rejects.toThrow();
    expect((await deleteAccount(request(tokenB, "DELETE"))).status).toBe(401);
  });
  it("enforces bounded payloads and the shared write rate limit", async () => {
    const a = newAttempt();
    expect(
      (
        await PUT(
          request(tokenA, "PUT", { attempt: a, padding: "x".repeat(25000) }),
          ctx(a.id),
        )
      ).status,
    ).toBe(413);
    await admin()
      .db.doc(`rateLimits/${uidA}`)
      .set({ start: Date.now(), count: 100 });
    expect(
      (await PUT(request(tokenA, "PUT", { attempt: a }), ctx(a.id))).status,
    ).toBe(429);
    await admin().db.doc(`rateLimits/${uidA}`).delete();
  });
  it("keeps deletion retryable when Auth deletion fails after data cleanup", async () => {
    const user = await signup();
    const a = newAttempt();
    await PUT(request(user.idToken, "PUT", { attempt: a }), ctx(a.id));
    const spy = vi
      .spyOn(admin().auth, "deleteUser")
      .mockRejectedValueOnce(new Error("simulated outage"));
    expect((await deleteAccount(request(user.idToken, "DELETE"))).status).toBe(
      500,
    );
    spy.mockRestore();
    expect(
      (await admin().db.collection(`users/${user.localId}/attempts`).get())
        .empty,
    ).toBe(true);
    expect(
      (
        await PUT(
          request(user.idToken, "PUT", { attempt: newAttempt() }),
          ctx(a.id),
        )
      ).status,
    ).toBe(400);
    const next = newAttempt();
    expect(
      (await PUT(request(user.idToken, "PUT", { attempt: next }), ctx(next.id)))
        .status,
    ).toBe(409);
    expect((await deleteAccount(request(user.idToken, "DELETE"))).status).toBe(
      200,
    );
    await expect(admin().auth.getUser(user.localId)).rejects.toThrow();
  });
});
