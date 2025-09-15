import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Attachment, Expense } from "@/models"
import { ExpensesPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class ReceiptController extends BaseController<Expense> {
  async create() {
    return this.show()
  }

  async show() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense)) {
        return this.response.status(404).json({
          message: "Expense not found",
        })
      }

      const policy = this.buildPolicy(expense)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to download this expense receipt.",
        })
      }

      const receipt = await this.loadReceipt()
      if (isNil(receipt)) {
        return this.response.status(404).json({
          message: "This expense does not have an associated receipt.",
        })
      }

      const { name, content, mimeType } = receipt
      return this.response.status(200).type(mimeType).attachment(name).send(content)
    } catch (error) {
      logger.error(`Error downloading expense receipt: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Failed to download expense receipt: ${error}`,
      })
    }
  }

  private async loadExpense() {
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

  private async loadReceipt() {
    return Attachment.withScope("withContent").findOne({
      where: {
        targetId: this.params.expenseId,
        targetType: Attachment.TargetTypes.Expense,
      },
    })
  }

  private buildPolicy(expense: Expense) {
    return new ExpensesPolicy(this.currentUser, expense)
  }
}

export default ReceiptController
