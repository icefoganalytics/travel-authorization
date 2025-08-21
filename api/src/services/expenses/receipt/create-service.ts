import { readFileSync } from "fs"

import { CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"
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
    const { mimeType, extension } = await this.determineMimeTypeAndExtension(this.filePath)
    const name = this.buildFileName(this.expense.expenseType, extension)
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

  private buildFileName(expenseType: string, extension: string): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")
    if (isEmpty(extension)) {
      return `Receipt, ${expenseType}, ${date}`
    }

    return `Receipt, ${expenseType}, ${date}.${extension}`
  }

  private async determineMimeTypeAndExtension(
    filePath: string
  ): Promise<{ mimeType: string; extension: string }> {
    const { fileTypeFromFile } = await import("file-type")

    const fileTypeResult = await fileTypeFromFile(filePath)
    if (isNil(fileTypeResult)) {
      return {
        mimeType: "application/octet-stream",
        extension: "",
      }
    }

    return {
      mimeType: fileTypeResult.mime,
      extension: fileTypeResult.ext,
    }
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
