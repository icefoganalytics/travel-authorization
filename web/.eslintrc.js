require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    "vitest-globals/env": true,
  },
  extends: [
    "plugin:vitest-globals/recommended",
    "plugin:vue/recommended",
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  rules: {
    // Override/add rules' settings here
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
  },
}
