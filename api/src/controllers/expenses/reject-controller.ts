import { isNil } from "lodash"

import logger from "@/utils/logger"
import { Expense } from "@/models"
import { RejectPolicy } from "@/policies/expenses"
import { RejectService } from "@/services/expenses"
import { ShowSerializer } from "@/serializers/expenses"
import BaseController from "@/controllers/base-controller"

export class RejectController extends BaseController<Expense> {
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
          message: "You are not authorized to reject this expense.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const updatedExpense = await RejectService.perform(
        expense,
        permittedAttributes,
        this.currentUser
      )
      const serializedExpense = ShowSerializer.perform(updatedExpense, this.currentUser)
      return this.response.status(201).json({
        expense: serializedExpense,
        policy,
      })
    } catch (error) {
      logger.error(`Error rejecting expense: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to reject expense: ${error}`,
      })
    }
  }

  private loadExpense(): Promise<Expense | null> {
    return Expense.findByPk(this.params.expenseId, {
      include: ["travelAuthorization"],
    })
  }

  private buildPolicy(expense: Expense): RejectPolicy {
    return new RejectPolicy(this.currentUser, expense)
  }
}

export default RejectController
