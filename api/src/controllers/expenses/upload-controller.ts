import { isNil } from "lodash"
import { UploadedFile } from "express-fileupload"

import logger from "@/utils/logger"

import { Expense } from "@/models"
import { ExpensesPolicy } from "@/policies"
import { UploadService } from "@/services/expenses/upload-service"
import BaseController from "@/controllers/base-controller"

export class UploadController extends BaseController {
  async show() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense))
        return this.response.status(404).json({
          message: "Expense not found.",
        })

      const policy = this.buildPolicy(expense)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view receipts on this expense.",
        })
      }

      const { receipt } = expense
      if (isNil(receipt)) {
        return this.response.status(404).json({
          message: "This expense does not have an associated receipt.",
        })
      }

      const { name, content, mimeType } = receipt

      return this.response.attachment(name).type(mimeType).send(content)
    } catch (error) {
      logger.error(`Error downloading expense receipt: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: `Receipt retrieval failed: ${error}`,
      })
    }
  }

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

      // must match field name in web/src/api/expenses-api.ts#upload
      const file = this.request.files?.["receipt"] as UploadedFile | undefined
      if (isNil(file)) {
        return this.response.status(422).json({
          message: "No receipt was uploaded.",
        })
      }

      await UploadService.perform(expense, file)
      return this.response.status(201).json({
        expense,
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

  private loadExpense(): Promise<Expense | null> {
    return Expense.findByPk(this.params.expenseId, {
      include: [
        {
          association: "receipt",
          attributes: {
            exclude: ["content"],
          },
        },
        {
          association: "travelAuthorization",
          include: ["travelSegments"],
          order: [["travelSegments", "segmentNumber", "ASC"]],
        },
      ],
    })
  }

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }
}

export default UploadController
