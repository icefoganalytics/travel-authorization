/// <reference types="vitest" />

import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue2 from "@vitejs/plugin-vue2"
import Components from "unplugin-vue-components/vite"
import { VuetifyResolver } from "unplugin-vue-components/resolvers"

// Add @vitejs/plugin-vue2 if you want to test vue files.
export default defineConfig({
  plugins: [
    vue2(),

    // Auto-import Vuetify 2 components/directives (optional)
    Components({
      resolvers: [VuetifyResolver()],
      dts: false, // set to 'src/components.d.ts' once you start TS
      version: 2.7,
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
