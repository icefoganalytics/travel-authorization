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
  test: {
    globals: true, // https://vitest.dev/config/#globals
  },
})
