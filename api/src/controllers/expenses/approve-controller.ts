import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Expense } from "@/models"
import { ApprovePolicy } from "@/policies/expenses"
import { ApproveService } from "@/services/expenses"
import { ShowSerializer } from "@/serializers/expenses"
import BaseController from "@/controllers/base-controller"

export class ApproveController extends BaseController<Expense> {
  async create() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense)) {
        return this.response.status(404).json({
          message: "Expense not found.",
        })
      }

      const policy = this.buildPolicy(expense)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to approve this expense.",
        })
      }

      const updatedExpense = await ApproveService.perform(expense, this.currentUser)
      const serializedExpense = ShowSerializer.perform(updatedExpense, this.currentUser)
      return this.response.status(201).json({
        expense: serializedExpense,
        policy,
      })
    } catch (error) {
      logger.error(`Error approving expense: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to approve expense: ${error}`,
      })
    }
  }

  private loadExpense(): Promise<Expense | null> {
    return Expense.findByPk(this.params.expenseId, {
      include: ["travelAuthorization"],
    })
  }

  private buildPolicy(expense: Expense): ApprovePolicy {
    return new ApprovePolicy(this.currentUser, expense)
  }
}

export default ApproveController
