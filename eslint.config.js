import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  js.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect"
      }
    },
    plugins: {
      "react": pluginReact,
      "react-hooks": pluginReactHooks
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/prop-types": "off", // Disable prop-types since we're not using them consistently
      "no-unused-vars": ["warn", {
        "varsIgnorePattern": "^[A-Z]", // Allow unused uppercase variables (components)
        "argsIgnorePattern": "^_"
      }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }] // Allow console.warn and console.error, warn on console.log
    }
  }
];
