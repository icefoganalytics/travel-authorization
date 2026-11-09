import type { PDFOptions } from "puppeteer" with { "resolution-mode": "import" }

export type PdfOptions = PDFOptions

export class PdfClient {
  async htmlToPdf(htmlDocument: string, options: PdfOptions = {}): Promise<Buffer> {
    // TypeScript's Node16 mode rejects static ESM imports from this CommonJS module.
    const { default: puppeteer } = await import("puppeteer")

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: "shell",
      args: ["--enable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
    })

    try {
      const page = await browser.newPage()
      await page.setJavaScriptEnabled(false)
      await page.setContent(htmlDocument)

      const pdfBytes = await page.pdf(options)

      return Buffer.from(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength)
    } finally {
      await browser.close()
    }
  }
}

const pdfClient = new PdfClient()

export default pdfClient
