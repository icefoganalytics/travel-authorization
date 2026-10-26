import { mockPuppeteer } from "@/support/mock-puppeteer"

import generatePdf from "@/lib/generate-pdf"

describe("api/src/lib/generate-pdf.ts", () => {
  describe("generatePdf", () => {
    test("when rendering fails, closes the browser before rejecting", async () => {
      // Arrange
      const { browserState, page } = mockPuppeteer()
      page.setContent.mockRejectedValueOnce(new Error("Rendering failed"))
      const htmlDocument = "<!doctype html><html><body>Report</body></html>"

      // Act
      const result = generatePdf(htmlDocument)

      // Assert
      await expect(result).rejects.toThrow("Rendering failed")
      expect(browserState.connected).toBe(false)
    })
  })
})
