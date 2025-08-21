import { readFileSync } from "fs"
import path from "path"

import { CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"
import { DateTime } from "luxon"

import db, { Attachment, Expense } from "@/models"

import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  constructor(
    protected expense: Expense,
    protected filePath: string
  ) {
    super()
  }

  async perform(): Promise<Attachment> {
    const name = this.buildFileName(this.filePath, this.expense.expenseType)
    const mimeType = await this.determineMimeType(this.filePath)
    const content = readFileSync(this.filePath)
    const size = content.length

    const receiptAttributes: CreationAttributes<Attachment> = {
      targetId: this.expense.id,
      targetType: Attachment.TargetTypes.Expense,
      name,
      size,
      mimeType,
      content,
    }

    return db.transaction(async () => {
      const receipt = await this.ensureExpenseReceipt(receiptAttributes)
      return receipt.reload()
    })
  }

  private buildFileName(filePath: string, expenseType: string): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")
    const extension = path.extname(filePath) || ".bin"
    return `Receipt, ${expenseType}, ${date}${extension}`
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
