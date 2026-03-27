/// <reference types="vitest" />

import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify"

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: {
        labs: true,
      },
    }),
  ],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@/tests/support": fileURLToPath(new URL("./tests/support", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 8080,
  },
  css: {
    postcss: {
      plugins: [
        // Fix vite build includes @charset problem
        // https://github.com/vitejs/vite/issues/5655
        {
          postcssPlugin: "internal:charset-removal",
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === "charset") {
                atRule.remove()
              }
            },
          },
        },
      ],
    },
    // https://vitejs.dev/config/#css-preprocessoroptions
    // preprocessorOptions: {
    //   sass: {
    //     additionalData: [
    //       // vuetify variable overrides
    //       // '@import "@/styles/variables.scss"',
    //       "",
    //     ].join("\n"),
    //   },
    // },
  },
  test: {
    globals: true, // https://vitest.dev/config/#globals
  },
})
