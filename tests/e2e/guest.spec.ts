import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { newAttempt } from "../../lib/assessment/engine";
import { items } from "../../lib/assessment/items";

test("radar and practical exercises reflect the lowest EQ aspect", async ({
  page,
}) => {
  const attempt = newAttempt();
  attempt.responsesByItemId = Object.fromEntries(
    items.map((item) => {
      const directed = item.dimension === "regulation" ? 2 : 4;
      return [item.id, item.reverse ? 6 - directed : directed];
    }),
  );
  attempt.status = "completed";
  attempt.completedAt = new Date().toISOString();
  await page.goto("/");
  await page.evaluate(
    (a) =>
      sessionStorage.setItem(
        "ruang-eq-session-v1",
        JSON.stringify({ attempt: a, owner: null }),
      ),
    attempt,
  );
  await page.goto("/result");
  await expect(
    page.getByRole("img", { name: /Grafik radar lima aspek EQ/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Latihan untuk Regulasi Diri" }),
  ).toBeVisible();
  await expect(page.locator(".personal-exercises li")).toHaveCount(2);
  await expect(page.locator(".radar-area")).toHaveCount(1);
  await mkdir("test-results/artifacts", { recursive: true });
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/artifacts/radar-${width}.png`,
      fullPage: true,
    });
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("guest completes, refreshes, reviews, exports and clears without cloud requests", async ({
  page,
}) => {
  const cloud: string[] = [];
  page.on("request", (r) => {
    if (/firestore|identitytoolkit|\/api\/attempts|googleapis/.test(r.url()))
      cloud.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Mulai sebagai guest" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Mulai tes", exact: true }).click();
  const first = await page.locator(".question-title").textContent();
  await page.getByRole("radio", { name: "Sering", exact: true }).check();
  await page.reload();
  await expect(page.locator(".question-title")).toHaveText(first!);
  await expect(
    page.getByRole("radio", { name: "Sering", exact: true }),
  ).toBeChecked();
  for (let i = 0; i < 50; i++) {
    await page
      .getByRole("radio", {
        name: i === 3 ? "Tidak dapat menilai / belum mengalami" : "Sering",
        exact: true,
      })
      .check();
    await page
      .getByRole("button", {
        name: i === 49 ? "Tinjau jawaban" : "Berikutnya",
        exact: true,
      })
      .click();
  }
  await page
    .getByRole("button", { name: "Soal 4, tidak dapat menilai", exact: true })
    .click();
  await expect(
    page.getByRole("radio", {
      name: "Tidak dapat menilai / belum mengalami",
      exact: true,
    }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Tinjau semua jawaban" }).click();
  await page.getByRole("button", { name: "Lihat hasil refleksi" }).click();
  await expect(
    page.getByRole("heading", { name: "Profil lima dimensi" }),
  ).toBeVisible();
  await mkdir("test-results/artifacts", { recursive: true });
  for (const format of ["PDF", "PNG"]) {
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", { name: `Unduh ${format}`, exact: true })
      .click();
    const d = await pending;
    await d.saveAs(`test-results/artifacts/report.${format.toLowerCase()}`);
  }
  await page.getByRole("button", { name: "Give me a Coffe" }).click();
  await expect(
    page.getByText("Informasi rekening belum tersedia."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Give me a Coffe" }),
  ).toBeFocused();
  await page.screenshot({
    path: "test-results/artifacts/result-desktop.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(cloud).toEqual([]);
  await page.getByRole("button", { name: "Hapus sesi", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hapus sesi", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Hasil belum tersedia." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem("ruang-eq-session-v1")),
  ).toBeNull();
});
test("partial results, result reflow, 200 percent text and reduced motion", async ({
  page,
}) => {
  const attempt = newAttempt();
  attempt.responsesByItemId = Object.fromEntries(
    attempt.itemOrder.map((id) => [id, null]),
  );
  attempt.status = "completed";
  attempt.completedAt = new Date().toISOString();
  await page.goto("/");
  await page.evaluate(
    (a) =>
      sessionStorage.setItem(
        "ruang-eq-session-v1",
        JSON.stringify({ attempt: a, owner: null }),
      ),
    attempt,
  );
  await page.goto("/result");
  await expect(
    page.getByText("Hasil parsial.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".radar-area")).toHaveCount(0);
  await expect(page.locator(".radar-point")).toHaveCount(0);
  await expect(
    page.getByText("Data belum cukup untuk memilih latihan personal.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Ringkasan indeks refleksi", { exact: true }),
  ).toHaveCount(0);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({ content: "html {font-size:200%}" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Give me a Coffe" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest("dialog")),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Give me a Coffe" }),
  ).toBeFocused();
});
test("responsive pages, keyboard and accessible controls", async ({ page }) => {
  await mkdir("test-results/artifacts", { recursive: true });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/artifacts/home-${width}.png`,
      fullPage: true,
    });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Tentang asesmen" }).click();
  await expect(
    page.getByRole("heading", { name: "Refleksi yang bisa ditelusuri." }),
  ).toBeVisible();
  await page.goto("/test");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Mulai tes", exact: true }).click();
  await page.getByRole("button", { name: "Berikutnya", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Pilih satu jawaban" }),
  ).toBeVisible();
  await page
    .getByRole("radio", { name: "Hampir tidak pernah", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("radio", { name: "Jarang", exact: true }),
  ).toBeChecked();
  await page.screenshot({
    path: "test-results/artifacts/question-mobile.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const path of ["/privacy", "/history", "/result", "/methodology"]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
