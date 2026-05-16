import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,

  // Base TypeScript config (no type checking)
  ...tseslint.configs.recommended,

  // Type-aware rules — ONLY for TypeScript source files
  {
    files: ["**/*.ts"], // or ["src/**/*.ts"]
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname, // Important for flat config
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      // TypeScript rules that need types
      "@typescript-eslint/no-explicit-any": "error",
      // "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  eslintConfigPrettier,
);
