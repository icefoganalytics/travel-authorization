import db, { Attachment, Expense } from "@/models"

import BaseService from "@/services/base-service"
import { CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

type ExpressFileUpload = {
  name: string // "car.jpg"
  /*
  See https://github.com/richardgirges/express-fileupload/blob/98028e91d11b368df53ada2a183ecd863737baa4/lib/fileFactory.js#L54
  mv: (filePath, callback) => {
      // Define a propper move function.
      const moveFunc = fileUploadOptions.useTempFiles
        ? moveFromTemp(filePath, options, fileUploadOptions)
        : moveFromBuffer(filePath, options, fileUploadOptions);
      // Create a folder for a file.
      checkAndMakeDir(fileUploadOptions, filePath);
      // If callback is passed in, use the callback API, otherwise return a promise.
      return isFunc(callback) ? moveFunc(callback) : new Promise(moveFunc);
    }
  */
  mv: (path: string, callback: (err: unknown) => void) => void | ((path: string) => Promise<void>) // A function to move the file elsewhere on your server. Can take a callback or return a promise.
  mimetype: string // The mimetype of your file
  data: Buffer // A buffer representation of your file, returns empty buffer in case useTempFiles option was set to true.
  tempFilePath: string // A path to the temporary file in case useTempFiles option was set to true.
  truncated: boolean // A boolean that represents if the file is over the size limit
  size: number // Uploaded size in bytes
  md5: string // MD5 checksum of the uploaded file
}

export class UploadService extends BaseService {
  private expense: Expense
  private file: ExpressFileUpload

  // Info on file format: https://github.com/expressjs/multer#file-information
  constructor(expense: Expense, file: ExpressFileUpload) {
    super()
    this.expense = expense
    this.file = file
  }

  async perform(): Promise<Expense> {
    const { name, size, data, tempFilePath } = this.file
    const mimeType = await this.determineMimeType(tempFilePath)

    const receiptAttributes: CreationAttributes<Attachment> = {
      targetId: this.expense.id,
      targetType: Attachment.TargetTypes.Expense,
      name,
      size,
      mimeType,
      content: data,
    }

    return db.transaction(async () => {
      await this.ensureExpenseReceipt(receiptAttributes)
      return this.expense.reload({
        include: [
          {
            association: "receipt",
            attributes: {
              exclude: ["content"],
            },
          },
        ],
      })
    })
  }

  private async determineMimeType(filePath: string): Promise<string> {
    const { fileTypeFromFile } = await import("file-type")

    const fileTypeResult = await fileTypeFromFile(filePath)
    if (isNil(fileTypeResult)) {
      return "application/octet-stream"
    }

    return fileTypeResult.mime
  }

  private async ensureExpenseReceipt(
    attachmentAttributes: CreationAttributes<Attachment>
  ): Promise<Attachment> {
    const { targetId, targetType } = attachmentAttributes

    const attachment = await Attachment.findOne({
      where: {
        targetId,
        targetType,
      },
    })
    if (!isNil(attachment)) {
      return attachment.update(attachmentAttributes)
    }

    return Attachment.create(attachmentAttributes)
  }
}
