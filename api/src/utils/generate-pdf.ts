import puppeteer, { type PDFOptions } from "puppeteer"

export async function generatePdf(htmlDocument: string, options: PDFOptions = {}): Promise<Buffer> {
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

export default generatePdf
