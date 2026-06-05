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

  /**
   * See https://github.com/sequelize/sequelize/blob/52e3c30d2927879ed47cbcf19f55e5cc10ba3771/packages/core/test/integration/model/scope/aggregate.test.js
   */
  private async computeTotalCost(
    scopedExpenses: ModelStatic<Expense>,
    where: WhereOptions<Attributes<Expense>>
  ): Promise<number> {
    const totalCost = await scopedExpenses.aggregate<number | null, Expense>("cost", "SUM", {
      where,
      // Query enhancers
      plain: true,
      // @ts-expect-error Not in AggregateOptions type but supported at runtime
      includeIgnoreAttributes: false,
      limit: null,
      offset: null,
      order: null,
      attributes: [],
    })
    return totalCost ?? 0
  }
}

export default IndexService
