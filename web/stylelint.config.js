export default {
  extends: ["stylelint-config-recommended"],
  rules: {
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["deep", "global", "slotted"] }],
  },
  overrides: [
    {
      files: ["**/*.vue"],
      customSyntax: "postcss-html",
      rules: {
        // Existing Vue components may have empty style blocks.
        "no-empty-source": null,
      },
    },
  ],
}
