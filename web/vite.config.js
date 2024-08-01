/// <reference types="vitest" />
import path from "path"

// Add @vitejs/plugin-vue2 if you want to test vue files.
export default {
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
    extensions: [".js", ".json", ".mjs", ".vue"],
  },
  test: {
    globals: true, // https://vitest.dev/config/#globals
  },
}
