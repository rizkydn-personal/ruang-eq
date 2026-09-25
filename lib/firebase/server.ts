import "server-only";
import { createHash } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
export function admin() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId)
    throw new ApiError(503, "Penyimpanan akun belum dikonfigurasi.");
  const app =
    getApps()[0] ||
    initializeApp({
      projectId,
      ...(process.env.FIRESTORE_EMULATOR_HOST
        ? {}
        : {
            credential: cert({
              projectId,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
                /\\n/g,
                "\n",
              ),
            }),
          }),
    });
  return { db: getFirestore(app), auth: getAuth(app) };
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function deletionLockId(uid: string) {
  return createHash("sha256").update(uid).digest("hex");
}
export async function authorize(req: Request, mutation = false) {
  if (
    mutation &&
    req.headers.get("origin") !==
      (process.env.APP_ORIGIN || "http://127.0.0.1:3000")
  )
    throw new ApiError(403, "Origin tidak diizinkan.");
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new ApiError(401, "Silakan masuk kembali.");
  const { auth, db } = admin();
  let identity;
  try {
    identity = await auth.verifyIdToken(token, true);
  } catch {
    throw new ApiError(401, "Sesi berakhir. Silakan masuk kembali.");
  }
  if (mutation) {
    const ref = db.doc(`rateLimits/${identity.uid}`);
    await db.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      const now = Date.now();
      const data = s.data();
      const same = data && now - data.start < 60000;
      const count = same ? data.count + 1 : 1;
      if (count > 100)
        throw new ApiError(
          429,
          "Terlalu banyak permintaan. Coba lagi dalam satu menit.",
        );
      tx.set(ref, {
        start: same ? data.start : now,
        count,
        expiresAt: new Date(now + 120000),
      });
    });
  }
  return { ...identity, db, auth };
}
export async function readBody(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Gunakan JSON.");
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError(400, "Data kosong.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 24000) {
      await reader.cancel();
      throw new ApiError(413, "Data terlalu besar.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "JSON tidak valid.");
  }
}
export function reply(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function failure(e: unknown) {
  return reply(
    {
      error:
        e instanceof ApiError
          ? e.message
          : "Permintaan gagal. Periksa koneksi lalu coba lagi.",
    },
    e instanceof ApiError ? e.status : 500,
  );
}
export { FieldValue };
