import { CreationAttributes } from "sequelize"
import { isNil } from "lodash"

import { Expense } from "@/models"
import BaseService from "@/services/base-service"

export type ExpenseCreationAttributes = Partial<CreationAttributes<Expense>>

export class CreateService extends BaseService {
  constructor(private attributes: ExpenseCreationAttributes) {
    super()
  }

  async perform(): Promise<Expense> {
    const { description, cost, currency, type, expenseType, ...optionalAttributes } = this.attributes

    if (isNil(description)) {
      throw new Error("Description is required.")
    }

    if (isNil(cost)) {
      throw new Error("Cost is required.")
    }

    if (isNil(type)) {
      throw new Error("Type is required.")
    }

    if (isNil(expenseType)) {
      throw new Error("Expense type is required.")
    }

    const currencyOrDefault = currency ?? Expense.CurrencyTypes.CAD

    return Expense.create({
      ...optionalAttributes,
      description,
      cost,
      currency: currencyOrDefault,
      type,
      expenseType,
    })
  }
}
