import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Expense, TravelAuthorization } from "@/models"
import { ExpensesPolicy } from "@/policies"
import { ExpensesSerializer } from "@/serializers"
import { ExpensesService } from "@/services"
import BaseController from "@/controllers/base-controller"

export class ExpensesController extends BaseController<Expense> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["date", "ASC"],
        ["expenseType", "ASC"],
      ])

      const scopedExpenses = ExpensesPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedExpenses.count({ where })
      const expenses = await scopedExpenses.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      const serializedExpenses = ExpensesSerializer.asTable(expenses)
      return this.response.json({
        expenses: serializedExpenses,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching expenses: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve expenses: ${error}`,
      })
    }
  }

  async show() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense)) {
        return this.response.status(404).json({
          message: "Expense not found.",
        })
      }

      const policy = this.buildPolicy(expense)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this expense.",
        })
      }

      return this.response.status(200).json({
        expense,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching expense: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve expense: ${error}`,
      })
    }
  }

  async create() {
    try {
      const expense = await this.buildExpense()
      const policy = this.buildPolicy(expense)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this expense.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newExpense = await ExpensesService.create(permittedAttributes)
      return this.response.status(201).json({
        expense: newExpense,
      })
    } catch (error) {
      logger.error(`Error creating expense: ${error}`, { error })
      return this.response.status(422).json({
        message: `Expense creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const expense = await this.loadExpense()
      if (isNil(expense)) {
        return this.response.status(404).json({
          message: "Expense not found.",
        })
      }

      const policy = this.buildPolicy(expense)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this expense.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      await expense.update(permittedAttributes)
      return this.response.json({
        expense,
      })
    } catch (error) {
      logger.error(`Error updating expense: ${error}`, { error })
      return this.response.status(422).json({
        message: `Expense update failed: ${error}`,
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
          message: "You are not authorized to delete this expense.",
        })
      }

      await expense.destroy()
      return this.response.status(204).end()
    } catch (error) {
      logger.error(`Error deleting expense: ${error}`, { error })
      return this.response.status(422).json({
        message: `Expense deletion failed: ${error}`,
      })
    }
  }

  private async buildExpense() {
    const attributes = this.request.body
    const expense = Expense.build(attributes)

    const { travelAuthorizationId } = attributes
    const travelAuthorization = await this.loadTravelAuthorization(travelAuthorizationId)
    if (!isNil(travelAuthorization)) {
      expense.travelAuthorization = travelAuthorization
    }

    return expense
  }

  private loadTravelAuthorization(
    travelAuthorizationId: number
  ): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(travelAuthorizationId, {
      include: ["travelSegments"],
      order: [["travelSegments", "segmentNumber", "ASC"]],
    })
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

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }
}

export default ExpensesController
