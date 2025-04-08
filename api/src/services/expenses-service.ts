import { CreationAttributes } from "sequelize"

import db from "@/db/db-client"

import { Expense } from "@/models"
import BaseService from "./base-service"

export class ExpensesService extends BaseService {
  static async bulkCreate(
    travelAuthorizationId: number,
    expenses: CreationAttributes<Expense>[]
  ): Promise<Expense[]> {
    if (!expenses.every((expense) => expense.travelAuthorizationId === travelAuthorizationId)) {
      throw new Error("All expenses must belong to the same form.")
    }

    return Expense.bulkCreate(expenses)
  }

  static async bulkReplace(
    travelAuthorizationId: number,
    expenses: CreationAttributes<Expense>[]
  ): Promise<Expense[]> {
    if (!expenses.every((expense) => expense.travelAuthorizationId === travelAuthorizationId)) {
      throw new Error("All expenses must belong to the same form.")
    }

    return db.transaction(async () => {
      await Expense.destroy({ where: { travelAuthorizationId } })
      return Expense.bulkCreate(expenses)
    })
  }
}

export default ExpensesService
