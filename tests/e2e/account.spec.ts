import { test, expect } from "@playwright/test";
import { newAttempt } from "../../lib/assessment/engine";
test("login and logout use accessible app confirmations", async ({ page }) => {
  const nativeDialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    nativeDialogs.push(dialog.message());
    await dialog.dismiss();
  });
  const attempt = newAttempt();
  attempt.responsesByItemId[attempt.itemOrder[0]] = 3;
  await page.goto("/");
  await page.evaluate(
    (a) =>
      sessionStorage.setItem(
        "ruang-eq-session-v1",
        JSON.stringify({ attempt: a, owner: null }),
      ),
    attempt,
  );
  await page.reload();
  const login = page.getByRole("button", {
    name: "Masuk dengan Google",
    exact: true,
  });
  await login.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("Masuk dengan Google?");
  await expect(dialog.getByRole("button", { name: "Batal" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(login).toBeFocused();
  expect(
    await page.evaluate(() => sessionStorage.getItem("ruang-eq-session-v1")),
  ).not.toBeNull();
  await login.click();
  const pending = page.waitForEvent("popup");
  await dialog.getByRole("button", { name: "Lanjutkan masuk" }).click();
  const popup = await pending;
  await popup.getByRole("button", { name: "Add new account" }).click();
  await popup
    .locator("#email-input")
    .fill(`qa-dialog-${Date.now()}@example.test`);
  await popup.getByRole("button", { name: "Sign in with Google.com" }).click();
  await expect(
    page.getByRole("link", { name: "Buka akun saya" }),
  ).toBeVisible();
  await page.goto("/history");
  await page.route("**/api/attempts", (route) =>
    route.fulfill({ status: 502, body: "" }),
  );
  await page.getByRole("button", { name: "Muat ulang" }).click();
  const historyError = page
    .getByRole("alert")
    .filter({ hasText: "Layanan penyimpanan" });
  await expect(historyError).toContainText(
    "Layanan penyimpanan sedang tidak tersedia",
  );
  await expect(page.getByText("Belum ada asesmen tersimpan.")).toHaveCount(0);
  await page.unroute("**/api/attempts");
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Belum ada asesmen tersimpan." }),
  ).toBeVisible();
  await expect(historyError).toHaveCount(0);
  await page.getByRole("button", { name: "Keluar dari akun" }).click();
  await expect(dialog).toHaveAccessibleName("Keluar dari akun?");
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/qa-artifacts/logout-confirmation-mobile.png",
  });
  await dialog.getByRole("button", { name: "Keluar", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Tutup konfirmasi" }),
  ).toBeFocused();
  await dialog.getByRole("button", { name: "Batal" }).click();
  await expect(
    page.getByRole("button", { name: "Keluar dari akun" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keluar dari akun" }).click();
  await dialog.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(login).toBeVisible();
  expect(nativeDialogs).toEqual([]);
});

test("Google emulator login, cloud draft, offline retry, resume, result history and deletion", async ({
  page,
}) => {
  await page.goto("/");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Masuk dengan Google" }).click();
  const popup = await popupPromise;
  await popup.getByRole("button", { name: "Add new account" }).click();
  await popup
    .locator("#email-input")
    .fill("qa-" + Date.now() + "@example.test");
  await popup.locator("#display-name-input").fill("QA Emulator");
  await popup.getByRole("button", { name: "Sign in with Google.com" }).click();
  await expect(
    page.getByRole("link", { name: "Buka akun saya" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Mulai dengan akun" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Mulai tes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Tersimpan di akun");
  await page.route("**/api/attempts/*", (route) =>
    route.request().method() === "PUT"
      ? route.abort("internetdisconnected")
      : route.continue(),
  );
  await page.getByRole("radio", { name: "Sering", exact: true }).check();
  await expect(page.getByRole("status")).toContainText("Gagal menyimpan");
  await page.unroute("**/api/attempts/*");
  await page.getByRole("button", { name: "Coba simpan lagi" }).click();
  await expect(page.getByRole("status")).toContainText("Tersimpan di akun");
  await page.goto("/history");
  await page.getByRole("button", { name: "Lanjutkan draft" }).first().click();
  await expect(
    page.getByRole("radio", { name: "Sering", exact: true }),
  ).toBeChecked();
  for (let i = 0; i < 50; i++) {
    await page.getByRole("radio", { name: "Sering", exact: true }).check();
    await page
      .getByRole("button", {
        name: i === 49 ? "Tinjau jawaban" : "Berikutnya",
        exact: true,
      })
      .click();
  }
  await page.getByRole("button", { name: "Lihat hasil refleksi" }).click();
  await expect(
    page.getByRole("heading", { name: "Profil lima dimensi" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Tersimpan di akun");
  await page.goto("/history");
  await page
    .getByRole("link", { name: "Buka hasil", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Profil lima dimensi" }),
  ).toBeVisible();
  await page.goto("/history");
  await page
    .getByRole("button", { name: "Hapus", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hapus asesmen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Belum ada asesmen tersimpan." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keluar dari akun" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Batal" }).click();
  await expect(
    page.getByRole("button", { name: "Keluar dari akun" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Keluar dari akun" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Keluar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Masuk dengan Google" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem("ruang-eq-session-v1")),
  ).toBeNull();
});
test("mobile popup cancellation and blocked popup expose actionable states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const pending = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Masuk dengan Google" }).click();
  const popup = await pending;
  await popup.waitForLoadState("domcontentloaded");
  await popup.close();
  await expect(
    page.getByRole("alert").filter({ hasText: "Login dibatalkan" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.open = () => null;
  });
  await page.getByRole("button", { name: "Masuk dengan Google" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Popup diblokir" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Masuk melalui pengalihan" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Masuk melalui pengalihan" }).click();
  await page.getByRole("button", { name: "Add new account" }).click();
  await page
    .locator("#email-input")
    .fill(`qa-redirect-${Date.now()}@example.test`);
  await page.getByRole("button", { name: "Sign in with Google.com" }).click();
  await expect(
    page.getByRole("link", { name: "Buka akun saya" }),
  ).toBeVisible();
});
test("donation dialog supports long account details and copy feedback", async ({
  page,
  context,
}) => {
  const a = newAttempt();
  a.responsesByItemId = Object.fromEntries(a.itemOrder.map((id) => [id, 3]));
  a.status = "completed";
  a.completedAt = new Date().toISOString();
  await page.goto("/");
  await page.evaluate(
    (attempt) =>
      sessionStorage.setItem(
        "ruang-eq-session-v1",
        JSON.stringify({ attempt, owner: null }),
      ),
    a,
  );
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/result");
  await page.getByRole("button", { name: "Give me a Coffe" }).click();
  await expect(page.getByText("Bank QA simulasi")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Salin nomor rekening" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Nomor rekening disalin.",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "0000-REKENING-SIMULASI-QA-".repeat(4),
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = () =>
      Promise.reject(new Error("simulated denied"));
  });
  await page.getByRole("button", { name: "Salin nomor rekening" }).click();
  await expect(page.getByRole("status")).toContainText("Tidak dapat menyalin.");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Give me a Coffe" }),
  ).toBeFocused();
});
