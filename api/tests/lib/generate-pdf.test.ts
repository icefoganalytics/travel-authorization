const browserState = vi.hoisted(() => ({ connected: false }))

vi.mock("puppeteer", () => ({
  default: {
    async launch() {
      browserState.connected = true

      return {
        async newPage() {
          return {
            async setJavaScriptEnabled() {},
            async setContent() {
              throw new Error("Rendering failed")
            },
          }
        },
        async close() {
          browserState.connected = false
        },
      }
    },
  },
}))

import { generatePdf } from "@/lib/generate-pdf"

describe("api/src/lib/generate-pdf.ts", () => {
  describe("generatePdf", () => {
    test("when rendering fails, closes the browser before rejecting", async () => {
      // Arrange
      const htmlDocument = "<!doctype html><html><body>Report</body></html>"

      // Act
      const result = generatePdf(htmlDocument)

      // Assert
      await expect(result).rejects.toThrow("Rendering failed")
      expect(browserState.connected).toBe(false)
    })
  })
})
