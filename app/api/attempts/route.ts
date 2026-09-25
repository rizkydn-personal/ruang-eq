import { authorize, failure, reply } from "@/lib/firebase/server";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { uid, db } = await authorize(req);
    const cursor = new URL(req.url).searchParams.get("cursor");
    let q = db
      .collection(`users/${uid}/attempts`)
      .orderBy("updatedAt", "desc")
      .orderBy("__name__", "desc")
      .limit(10);
    if (cursor) {
      if (!/^[0-9a-f-]{36}$/.test(cursor))
        return reply({ error: "Cursor tidak valid." }, 400);
      const doc = await db.doc(`users/${uid}/attempts/${cursor}`).get();
      if (!doc.exists)
        return reply({ error: "Posisi riwayat berubah. Muat ulang." }, 409);
      q = q.startAfter(doc);
    }
    const s = await q.get();
    return reply({
      attempts: s.docs.map((d) => d.data()),
      nextCursor: s.size === 10 ? s.docs.at(-1)!.id : null,
    });
  } catch (e) {
    return failure(e);
  }
}
