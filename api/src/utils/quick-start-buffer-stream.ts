import { PassThrough } from "node:stream"
import { type Response } from "express"

import logger from "@/utils/logger"

const CSV_MAGIC_NUMBER = [0xef, 0xbb, 0xbf]
const ZIP_MAGIC_NUMBER = [0x50, 0x4b, 0x03, 0x04]
const PDF_MAGIC_NUMBER = [0x25, 0x50, 0x44, 0x46, 0x2d]

export async function quickStartBufferStream(
  response: Response,
  mimeType: string,
  contentFunction: () => Promise<Buffer>
) {
  const passthrough = new PassThrough()
  const fileMagicNumber = (() => {
    switch (mimeType) {
      case "text/csv":
        return CSV_MAGIC_NUMBER
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return ZIP_MAGIC_NUMBER
      case "application/pdf":
        return PDF_MAGIC_NUMBER
      default:
        logger.warn(`Could not quick-start stream for unsupported MIME type: ${mimeType}`)
        return []
    }
  })()

  const magicNumber = Buffer.from(fileMagicNumber)
  passthrough.pipe(response)
  passthrough.write(magicNumber)

  try {
    const content = await contentFunction()
    const contentStartsWithMagicNumber = content.subarray(0, magicNumber.length).equals(magicNumber)
    passthrough.end(content.subarray(contentStartsWithMagicNumber ? magicNumber.length : 0))
  } catch (error) {
    passthrough.end()
    throw error
  }
}

export default quickStartBufferStream
