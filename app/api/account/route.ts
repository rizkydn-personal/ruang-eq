import {
  ApiError,
  authorize,
  deletionLockId,
  failure,
  reply,
} from "@/lib/firebase/server";
export async function DELETE(req: Request) {
  try {
    const { uid, db, auth, auth_time } = await authorize(req, true);
    if (Date.now() / 1000 - auth_time > 300)
      throw new ApiError(401, "Masuk ulang sebelum menghapus akun.");
    const ref = db.doc(`users/${uid}`);
    const lock = db.doc(`deletionLocks/${deletionLockId(uid)}`);
    await lock.set({ expiresAt: new Date(Date.now() + 86400000) });
    await ref.set({ deleting: true }, { merge: true });
    await db.recursiveDelete(ref.collection("attempts"));
    await ref.delete();
    await db.doc(`rateLimits/${uid}`).delete();
    try {
      await auth.deleteUser(uid);
    } catch (e) {
      if ((e as { code?: string }).code !== "auth/user-not-found") throw e;
    }
    // Only the expiring lock remains if this cleanup fails; personal data is already removed.
    await lock.delete().catch(() => undefined);
    return reply({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
