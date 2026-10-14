import js from "@eslint/js";
import ts from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
export default ts.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "output/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
);
