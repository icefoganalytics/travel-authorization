import { mockPuppeteer } from "@/support/mock-puppeteer"

import generatePdf from "@/lib/generate-pdf"

describe("api/src/lib/generate-pdf.ts", () => {
  describe("generatePdf", () => {
    test("when rendering succeeds, it returns only the PDF byte range", async () => {
      // Arrange
      const { page } = mockPuppeteer()
      const backingBytes = Buffer.from("\0%PDF-1.7\n%%EOF\n\0")
      const pdfBytes = backingBytes.subarray(1, -1)
      page.pdf.mockResolvedValueOnce(pdfBytes)
      const htmlDocument = "<!doctype html><html><body>Report</body></html>"

      // Act
      const result = await generatePdf(htmlDocument)

      // Assert
      expect(result).toEqual(Buffer.from("%PDF-1.7\n%%EOF\n"))
    })

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
