import { Attributes } from "sequelize"
import { isNil } from "lodash"

import { type WithRequired } from "@/utils/utility-types"

import db, { Expense } from "@/models"
import BaseService from "@/services/base-service"

export type ExpenseAttributes = Partial<Attributes<Expense>>
export type ExpenseBulkReplaceAttributes = ExpenseAttributes[]

export class BulkReplaceService extends BaseService {
  constructor(
    protected travelAuthorizationId: number,
    protected expensesAttributes: ExpenseBulkReplaceAttributes
  ) {
    super()
  }

  async perform(): Promise<Expense[]> {
    if (
      !this.expensesAttributes.every(
        (expense) => expense.travelAuthorizationId === this.travelAuthorizationId
      )
    ) {
      throw new Error("All expenses must belong to the same travel authorization.")
    }

    const initialType = this.expensesAttributes[0].type
    if (!this.expensesAttributes.every((expense) => expense.type === initialType)) {
      throw new Error("All expenses must be of the same type.")
    }

    return db.transaction(async () => {
      await Expense.destroy({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
        },
      })

      this.hasAllRequiredAttributes(this.expensesAttributes)
      return Expense.bulkCreate(this.expensesAttributes)
    })
  }

  private hasAllRequiredAttributes(
    expensesAttributes: ExpenseAttributes[]
  ): asserts expensesAttributes is WithRequired<
    ExpenseAttributes,
    "description" | "cost" | "currency" | "type" | "expenseType"
  >[] {
    for (const { description, cost, currency, type, expenseType } of expensesAttributes) {
      if (isNil(description)) {
        throw new Error("Description is required.")
      }

      if (isNil(cost)) {
        throw new Error("Cost is required.")
      }

      if (isNil(currency)) {
        throw new Error("Currency is required.")
      }

      if (isNil(type)) {
        throw new Error("Type is required.")
      }

      if (isNil(expenseType)) {
        throw new Error("Expense type is required.")
      }
    }
  }
}
