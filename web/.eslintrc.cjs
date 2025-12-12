/* eslint-env node */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("@rushstack/eslint-patch/modern-module-resolution")

// https://github.com/typescript-eslint/typescript-eslint/issues/251
module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
    "vitest-globals/env": true,
    "vue/setup-compiler-macros": true,
  },

  extends: [
    "eslint:recommended",
    "plugin:vitest-globals/recommended",
    "plugin:vue/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],

  plugins: ["vue", "@typescript-eslint"],

  // Parse .vue SFCs and delegate <script lang="ts"> to TS parser
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module",
    extraFileExtensions: [".vue"],
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.node.json", "./tsconfig.json", "./tests/tsconfig.json"],
  },

  settings: {
    // Helps some vue rules behave correctly on 2.7
    vue: { version: "2.7.0" },
  },

  ignorePatterns: ["dist/", "coverage/"],

  rules: {
    "vue/valid-v-slot": [
      "error",
      {
        allowModifiers: true,
      },
    ],
    "vue/no-unused-vars": [
      "error",
      {
        ignorePattern: "^_",
      },
    ],

    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
}
