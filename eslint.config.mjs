import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
export default defineConfig([
  ...next,
  ...ts,
  globalIgnores([
    ".next/**",
    ".npm-cache/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
  ]),
  { rules: { "react-hooks/set-state-in-effect": "off" } },
]);
