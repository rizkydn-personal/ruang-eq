import { z } from "zod";
import { attemptSchema, score } from "@/lib/assessment/engine";
import {
  ApiError,
  authorize,
  deletionLockId,
  failure,
  FieldValue,
  readBody,
  reply,
} from "@/lib/firebase/server";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
async function target(req: Request, ctx: Context, mutation = false) {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success)
    throw new ApiError(400, "ID tidak valid.");
  const a = await authorize(req, mutation);
  return { ...a, ref: a.db.doc(`users/${a.uid}/attempts/${id}`), id };
}
export async function GET(req: Request, ctx: Context) {
  try {
    const { ref } = await target(req, ctx);
    const s = await ref.get();
    if (!s.exists) throw new ApiError(404, "Hasil tidak ditemukan.");
    return reply(s.data());
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(req: Request, ctx: Context) {
  try {
    const { uid, db, ref, id } = await target(req, ctx, true);
    const body = await readBody(req);
    const parsed = attemptSchema.safeParse(body?.attempt);
    if (!parsed.success || parsed.data.id !== id)
      throw new ApiError(400, "Data jawaban atau versi instrumen tidak valid.");
    const incoming = parsed.data;
    const result = await db.runTransaction(async (tx) => {
      const user = db.doc(`users/${uid}`);
      const profile = await tx.get(user);
      const deleting = await tx.get(
        db.doc(`deletionLocks/${deletionLockId(uid)}`),
      );
      const old = await tx.get(ref);
      const previous = old.data();
      if (profile.data()?.deleting || deleting.exists)
        throw new ApiError(409, "Penghapusan akun sedang berlangsung.");
      if (previous?.status === "completed") {
        const same =
          incoming.status === "completed" &&
          previous.seed === incoming.seed &&
          incoming.itemOrder.every(
            (id) =>
              previous.responsesByItemId[id] === incoming.responsesByItemId[id],
          );
        if (!same)
          throw new ApiError(
            409,
            "Asesmen ini sudah diselesaikan di tab lain. Buka hasil tersimpan melalui Riwayat.",
          );
        return previous;
      }
      if ((previous?.revision ?? 0) !== incoming.revision)
        throw new ApiError(
          409,
          "Draft berubah di tab lain. Buka draft terbaru dari Riwayat sebelum melanjutkan.",
        );
      if (
        previous &&
        (previous.seed !== incoming.seed ||
          previous.createdAt !== incoming.createdAt)
      )
        throw new ApiError(409, "Identitas draft tidak dapat diubah.");
      const now = new Date().toISOString();
      const attempt = {
        ...incoming,
        revision: incoming.revision + 1,
        completedAt: incoming.status === "completed" ? now : null,
        resultSnapshot:
          incoming.status === "completed"
            ? score(incoming.responsesByItemId)
            : null,
        updatedAt: FieldValue.serverTimestamp(),
        cloudCreatedAt:
          previous?.cloudCreatedAt ?? FieldValue.serverTimestamp(),
      };
      tx.set(ref, attempt);
      tx.set(
        user,
        {
          updatedAt: FieldValue.serverTimestamp(),
          ...(profile.exists
            ? {}
            : { createdAt: FieldValue.serverTimestamp() }),
        },
        { merge: true },
      );
      return attempt;
    });
    return reply(result);
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(req: Request, ctx: Context) {
  try {
    const { ref } = await target(req, ctx, true);
    await ref.delete();
    return reply({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
