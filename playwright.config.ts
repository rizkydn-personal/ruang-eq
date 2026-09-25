import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore:
    process.env.EQ_E2E_EMULATOR === "1"
      ? ["**/guest.spec.ts"]
      : ["**/account.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  expect: { timeout: 20000 },
  use: {
    actionTimeout: 20000,
    baseURL:
      process.env.EQ_E2E_EMULATOR === "1"
        ? "http://127.0.0.1:3001"
        : "http://127.0.0.1:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      process.env.EQ_E2E_EMULATOR === "1"
        ? "npm run dev -- --port 3001"
        : "npm run dev",
    url:
      process.env.EQ_E2E_EMULATOR === "1"
        ? "http://127.0.0.1:3001"
        : "http://127.0.0.1:3000",
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY:
        process.env.EQ_E2E_EMULATOR === "1" ? "demo-key" : "",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.EQ_E2E_EMULATOR === "1" ? "demo-ruang-eq" : "",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "localhost",
      NEXT_PUBLIC_FIREBASE_APP_ID: "demo-app",
      NEXT_PUBLIC_USE_EMULATORS:
        process.env.EQ_E2E_EMULATOR === "1" ? "true" : "false",
      FIREBASE_PROJECT_ID: "demo-ruang-eq",
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
      APP_ORIGIN:
        process.env.EQ_E2E_EMULATOR === "1"
          ? "http://127.0.0.1:3001"
          : "http://127.0.0.1:3000",
      DONATION_BANK_NAME:
        process.env.EQ_E2E_EMULATOR === "1" ? "Bank QA simulasi" : "",
      DONATION_ACCOUNT_NUMBER:
        process.env.EQ_E2E_EMULATOR === "1"
          ? "0000-REKENING-SIMULASI-QA-".repeat(4)
          : "",
      DONATION_ACCOUNT_HOLDER:
        process.env.EQ_E2E_EMULATOR === "1"
          ? "Pemilik simulasi untuk pengujian tampilan panjang, bukan rekening nyata"
          : "",
      NEXT_PUBLIC_DONATION_BANK: "",
      NEXT_PUBLIC_DONATION_ACCOUNT: "",
      NEXT_PUBLIC_DONATION_NAME: "",
      NEXT_PUBLIC_PRODUCT_NAME: "Ruang EQ",
    },
    timeout: 120000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
