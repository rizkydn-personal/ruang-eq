import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { generateKeyPairSync, sign, verify } from "node:crypto";

// Reproduce serverless runtimes without require(ESM), without credentials/network.
const auth = await import("firebase-admin/auth");
assert.equal(typeof auth.getAuth, "function");
await import("firebase-admin/firestore");
const adminRequire = createRequire(import.meta.resolve("firebase-admin/auth"));
const jwksRsa = adminRequire("jwks-rsa");
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const client = jwksRsa({
  jwksUri: "https://unused.invalid/jwks",
  cache: false,
  getKeysInterceptor: async () => [
    {
      ...publicKey.export({ format: "jwk" }),
      kid: "runtime-test",
      alg: "RS256",
      use: "sig",
    },
  ],
});
const key = await client.getSigningKey("runtime-test");
const payload = Buffer.from("Firebase runtime compatibility test");
const signature = sign("RSA-SHA256", payload, privateKey);
assert.ok(verify("RSA-SHA256", payload, key.getPublicKey(), signature));
assert.equal(
  verify("RSA-SHA256", Buffer.from("tampered"), key.getPublicKey(), signature),
  false,
);
console.log(
  "Firebase imports and JWKS signature verification passed without require(ESM).",
);
