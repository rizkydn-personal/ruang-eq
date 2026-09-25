import { describe, expect, it } from "vitest";
import { readApiResponse } from "../lib/api-response";

describe("account API responses", () => {
  it("preserves successful history and mutation responses", async () => {
    for (const value of [{ attempts: [], nextCursor: null }, { ok: true }]) {
      await expect(readApiResponse(Response.json(value))).resolves.toEqual(
        value,
      );
    }
  });
  it.each(["", "<html>Bad Gateway</html>", '{"error":'])(
    "handles empty, HTML and truncated server failures: %s",
    async (body) => {
      await expect(
        readApiResponse(new Response(body, { status: 502 })),
      ).rejects.toThrow("Layanan penyimpanan sedang tidak tersedia");
    },
  );
  it.each(["", "null", "[]", '"ok"', '{"attempts":'])(
    "does not mistake invalid success bodies for saved data: %s",
    async (body) => {
      await expect(readApiResponse(new Response(body))).rejects.toThrow(
        "Respons server tidak lengkap atau tidak valid",
      );
    },
  );
  it("preserves API errors and explains empty unauthorized responses", async () => {
    await expect(
      readApiResponse(
        Response.json(
          { error: "Posisi riwayat berubah. Muat ulang." },
          { status: 409 },
        ),
      ),
    ).rejects.toThrow("Posisi riwayat berubah. Muat ulang.");
    await expect(
      readApiResponse(new Response("", { status: 401 })),
    ).rejects.toThrow("Sesi berakhir. Silakan masuk kembali.");
  });
});
