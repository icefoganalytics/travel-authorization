import { readFileSync } from "node:fs"
import path from "node:path"

import { Factory } from "fishery"

type FileUploadAttributes = {
  name: string
  mimeType: string
  buffer: Buffer
}

const dataDirectory = path.join(__dirname, "..", "data")
const bookingDocument = Buffer.from(
  readFileSync(path.join(dataDirectory, "booking.pdf.base64"), "utf8"),
  "base64"
)
const receiptImage = Buffer.from(
  readFileSync(path.join(dataDirectory, "receipt.png.base64"), "utf8"),
  "base64"
)

export const bookingFileFactory = Factory.define<FileUploadAttributes>(() => ({
  name: "booking.pdf",
  mimeType: "application/pdf",
  buffer: bookingDocument,
}))

export const receiptFileFactory = Factory.define<FileUploadAttributes>(({ sequence }) => ({
  name: `receipt-${sequence}.png`,
  mimeType: "image/png",
  buffer: receiptImage,
}))
