import path from "path"

import { isNil } from "lodash"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { Expense } from "@/models"
import { ExpensesPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class ReceiptImageController extends BaseController<Expense> {
  async create() {
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

      const { fileName, receiptImage } = expense
      if (isNil(receiptImage)) {
        return this.response.status(404).json({
          message: "This expense does not have an associated receipt.",
        })
      }

      const formattedFileName = await this.buildFileName(fileName)
      return this.response
        .status(201)
        .header("Content-Type", "application/octet-stream")
        .attachment(formattedFileName)
        .send(receiptImage)
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
    return Expense.withScope(["withReceiptImage"]).findByPk(this.params.expenseId, {
      include: [
        {
          association: "travelAuthorization",
          include: ["travelSegments"],
          order: [["travelSegments", "segmentNumber", "ASC"]],
        },
      ],
    })
  }

  private buildPolicy(expense: Expense) {
    return new ExpensesPolicy(this.currentUser, expense)
  }

  private async buildFileName(documentName: string | null) {
    const date = DateTime.now().toFormat("yyyy-MM-dd")
    if (isNil(documentName)) {
      return `Receipt, ${date}.bin`
    }
    const extension = path.extname(documentName) || ".bin"
    const baseName = path.basename(documentName, extension)
    return `Receipt, ${baseName}, ${date}${extension}`
  }
}

export default ReceiptImageController
