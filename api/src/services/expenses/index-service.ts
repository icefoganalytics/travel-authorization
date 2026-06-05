import { Attributes, ModelStatic, WhereOptions } from "@sequelize/core"

import { Expense, User } from "@/models"
import { type BaseScopeOptions, ExpensesPolicy } from "@/policies"
import { type ModelOrder } from "@/controllers/base-controller"
import BaseService from "@/services/base-service"

export type ExpensesIndexSummaries = {
  totalCost: number
}

export class IndexService extends BaseService {
  constructor(
    private where: WhereOptions<Attributes<Expense>>,
    private scopes: BaseScopeOptions[],
    private order: ModelOrder[] | undefined,
    private limit: number,
    private offset: number,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<{
    expenses: Expense[]
    totalCount: number
    summaries: ExpensesIndexSummaries
  }> {
    const scopedExpenses = ExpensesPolicy.applyScope(this.scopes, this.currentUser)

    const totalCount = await scopedExpenses.count({ where: this.where })
    const expenses = await scopedExpenses.findAll({
      where: this.where,
      include: ["receipt", "travelAuthorization"],
      order: this.order,
      limit: this.limit,
      offset: this.offset,
    })
    const summaries = await this.computeSummaries(scopedExpenses, this.where)

    return {
      expenses,
      totalCount,
      summaries,
    }
  }

  private async computeSummaries(
    scopedExpenses: ModelStatic<Expense>,
    where: WhereOptions<Attributes<Expense>>
  ): Promise<ExpensesIndexSummaries> {
    const totalCost = await this.computeTotalCost(scopedExpenses, where)
    return {
      totalCost,
    }
  }

  private async computeTotalCost(
    scopedExpenses: ModelStatic<Expense>,
    where: WhereOptions<Attributes<Expense>>
  ): Promise<number> {
    const totalCost = await scopedExpenses.sum("cost", {
      where,
    })
    return totalCost ?? 0
  }
}

export default IndexService
