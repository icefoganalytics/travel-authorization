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

export default defineConfig(async ({ command, mode }) => {
  const plugins = [
    vue(),
    vuetify({
      autoImport: {
        labs: true,
      },
    }),
    gatewayUrlLogger,
  ]

  if (
    command === "serve" &&
    mode === "development" &&
    process.env.OPEN_IN_EDITOR_BRIDGE_ENABLED === "true"
  ) {
    const integrationPath = "/open-in-editor-bridge/vite.mjs"
    const { default: openInEditorBridge } = await import(integrationPath)
    plugins.push(openInEditorBridge())
  }

  return {
    plugins,
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
  }
})
