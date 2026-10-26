import { mockPuppeteer } from "@/support/mock-puppeteer"

import pdfClient from "@/lib/pdf-client"

describe("api/src/lib/pdf-client.ts", () => {
  describe("PdfClient", () => {
    describe("#htmlToPdf", () => {
      test("when rendering succeeds, it returns only the PDF byte range", async () => {
        // Arrange
        const { page } = mockPuppeteer()
        const backingBytes = Buffer.from("\0%PDF-1.7\n%%EOF\n\0")
        const pdfBytes = backingBytes.subarray(1, -1)
        page.pdf.mockResolvedValueOnce(pdfBytes)
        const htmlDocument = "<!doctype html><html><body>Report</body></html>"

        // Act
        const result = await pdfClient.htmlToPdf(htmlDocument)

        // Assert
        expect(result).toEqual(Buffer.from("%PDF-1.7\n%%EOF\n"))
      })

      test("when rendering fails, it closes the browser before rejecting", async () => {
        // Arrange
        const { browserState, page } = mockPuppeteer()
        page.setContent.mockRejectedValueOnce(new Error("Rendering failed"))
        const htmlDocument = "<!doctype html><html><body>Report</body></html>"

        // Act
        const result = pdfClient.htmlToPdf(htmlDocument)

        // Assert
        await expect(result).rejects.toThrow("Rendering failed")
        expect(browserState.connected).toBe(false)
      })
    })
  })
})
