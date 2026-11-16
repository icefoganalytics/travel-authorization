import { PassThrough } from "node:stream"
import { pipeline } from "node:stream/promises"

import { type Response } from "express"

const FILE_PREFIXES = {
  "text/csv": Buffer.from("\uFEFF"),
}

export async function quickStartBufferStream(
  response: Response,
  mimeType: keyof typeof FILE_PREFIXES,
  contentFunction: () => Promise<Buffer>
): Promise<void> {
  const passthrough = new PassThrough()
  const prefix = FILE_PREFIXES[mimeType]
  const transfer = pipeline(passthrough, response)
  passthrough.write(prefix)

  const generation = writeContent()
  try {
    await Promise.all([transfer, generation])
  } catch (error) {
    passthrough.destroy()
    throw error
  }

  async function writeContent() {
    const content = await contentFunction()
    const contentStartsWithPrefix = content.subarray(0, prefix.length).equals(prefix)
    passthrough.end(content.subarray(contentStartsWithPrefix ? prefix.length : 0))
  }
}

export default quickStartBufferStream
