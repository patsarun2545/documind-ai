import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "prefer-const": "warn",
      "no-console": "off"
    }
  }
];

export default eslintConfig;
