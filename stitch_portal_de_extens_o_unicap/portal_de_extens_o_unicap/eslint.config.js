import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Blob: "readonly",
        HTMLAnchorElement: "readonly",
        process: "readonly",
        Buffer: "readonly",
        File: "readonly",
        FileReader: "readonly",
        FormData: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly"
      }
    },
    settings: { react: { version: "detect", jsxRuntime: "automatic" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      // Sprint 6 fará a padronização completa; novos componentes já usam prop-types.
      "react/prop-types": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  },
  prettier
];
