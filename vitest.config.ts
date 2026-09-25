import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.integration.ts"],
    exclude: process.env.FIRESTORE_EMULATOR_HOST
      ? []
      : ["tests/**/*.integration.ts"],
    testTimeout: 30000,
  },
});
