/// <reference types="vitest" />

import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify"

const gatewayUrlLogger = {
  name: "gateway-url-logger",
  apply: "serve",
  configureServer(server) {
    const hostname = process.env.GATEWAY_HOSTNAME
    if (!hostname) return

    server.httpServer?.once("listening", () => {
      console.log(`\n  Open Travel Authorization: http://${hostname}/`)
    })
  },
}

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: {
        labs: true,
      },
    }),
    gatewayUrlLogger,
  ],
  optimizeDeps: {
    // Auto-imported components are discovered on navigation; avoid optimizer-triggered reloads.
    exclude: ["vuetify"],
  },
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
    proxy: {
      // Forward editor-open requests to a host-side bridge so the host editor launches.
      "/__open-in-editor": {
        target: `http://host.docker.internal:${process.env.OPEN_IN_EDITOR_BRIDGE_PORT || "3333"}`,
        bypass() {
          if (!process.env.OPEN_IN_EDITOR_SESSION_ID) return false
        },
        rewrite(path) {
          const sessionId = process.env.OPEN_IN_EDITOR_SESSION_ID
          const requestUrl = new URL(path, "http://host.docker.internal")
          requestUrl.searchParams.set("session", sessionId)
          return `${requestUrl.pathname}${requestUrl.search}`
        },
      },
    },
  },
  test: {
    globals: true, // https://vitest.dev/config/#globals
  },
})
