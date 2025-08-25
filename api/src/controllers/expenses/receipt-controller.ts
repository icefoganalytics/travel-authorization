import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Attachment, Expense } from "@/models"
import { ExpensesPolicy } from "@/policies"
import { CreateService } from "@/services/expenses/receipt"
import BaseController from "@/controllers/base-controller"

export class ReceiptController extends BaseController {
  async create() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense))
        return this.response.status(404).json({
          message: "Expense not found.",
        })

      const policy = this.buildPolicy(expense)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to upload receipts to this expense.",
        })
      }

      // Info on file format: https://github.com/expressjs/multer#file-information
      // See https://github.com/richardgirges/express-fileupload/blob/98028e91d11b368df53ada2a183ecd863737baa4/lib/fileFactory.js#L54
      const { files } = this.request
      if (isNil(files)) {
        return this.response.status(422).json({
          message: "No receipt was uploaded.",
        })
      }

      // must match field name in web/src/api/expenses-api.ts#upload
      const { content } = files
      if (isNil(content)) {
        return this.response.status(422).json({
          message: "No receipt was uploaded.",
        })
      }

      if (Array.isArray(content)) {
        return this.response.status(422).json({
          message: "Only one receipt can be uploaded at a time.",
        })
      }

      const { tempFilePath } = content
      const receipt = await CreateService.perform(expense, tempFilePath)
      return this.response.status(201).json({
        receipt,
      })
    } catch (error) {
      logger.error(`Error uploading expense receipt: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Receipt upload failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense)) {
        return this.response.status(404).json({
          message: "Expense not found.",
        })
      }

      const policy = this.buildPolicy(expense)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete receipt from this expense.",
        })
      }

      const receipt = await this.loadReceipt()
      if (isNil(receipt)) {
        return this.response.status(404).json({
          message: "Receipt not found.",
        })
      }

      await receipt.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting receipt: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to delete receipt: ${error}`,
      })
    }
  }

  private loadExpense(): Promise<Expense | null> {
    return Expense.findByPk(this.params.expenseId, {
      include: [
        {
          association: "travelAuthorization",
          include: ["travelSegments"],
          order: [["travelSegments", "segmentNumber", "ASC"]],
        },
      ],
    })
  }

  private loadReceipt(): Promise<Attachment | null> {
    return Attachment.findByPk(this.params.receiptId, {
      where: {
        targetId: this.params.expenseId,
        targetType: Attachment.TargetTypes.Expense,
      },
    })
  }

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }
}

export default ReceiptController
