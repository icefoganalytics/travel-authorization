require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  env: {
    node: true,
    "vitest/globals": true,
  },
  extends: ["plugin:vue/recommended", "eslint:recommended", "plugin:prettier/recommended"],
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
  },
}
