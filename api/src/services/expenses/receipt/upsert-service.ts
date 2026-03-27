import { truncate } from "lodash"
import { DateTime } from "luxon"

import sanitizeForFileName from "@/utils/sanitize-for-file-name"

import { Attachment, Expense } from "@/models"
import BaseService from "@/services/base-service"
import { Attachments } from "@/services"

export class UpsertService extends BaseService {
  constructor(
    protected expense: Expense,
    protected filePath: string
  ) {
    super()
  }

  async perform(): Promise<Attachment> {
    const { expenseType, description } = this.expense
    const fileName = this.buildFileName(expenseType, description)

    return Attachments.UpsertService.perform(this.filePath, fileName, {
      targetId: this.expense.id,
      targetType: Attachment.TargetTypes.Expense,
    })
  }

  private buildFileName(expenseType: string, description: string): string {
    const safeDescription = truncate(sanitizeForFileName(description), {
      length: 60,
      separator: /,? +/,
      omission: "",
    })

    const date = DateTime.now().toFormat("yyyy-MM-dd")
    return `Receipt, ${expenseType} - ${safeDescription}, ${date}`
  }
}

export default UpsertService
