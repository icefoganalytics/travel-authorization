import { Attributes, ModelStatic, WhereOptions } from "@sequelize/core"

import { GeneralLedgerCoding, User } from "@/models"
import { type BaseScopeOptions, GeneralLedgerCodingsPolicy } from "@/policies"
import { type ModelOrder } from "@/controllers/base-controller"
import BaseService from "@/services/base-service"

export type GeneralLedgerCodingsIndexSummaries = {
  totalAmount: number
}

export class IndexService extends BaseService {
  constructor(
    private where: WhereOptions<Attributes<GeneralLedgerCoding>>,
    private scopes: BaseScopeOptions[],
    private order: ModelOrder[] | undefined,
    private limit: number,
    private offset: number,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<{
    generalLedgerCodings: GeneralLedgerCoding[]
    totalCount: number
    summaries: GeneralLedgerCodingsIndexSummaries
  }> {
    const scopedGeneralLedgerCodings = GeneralLedgerCodingsPolicy.applyScope(
      this.scopes,
      this.currentUser
    )

    const totalCount = await scopedGeneralLedgerCodings.count({ where: this.where })
    const generalLedgerCodings = await scopedGeneralLedgerCodings.findAll({
      where: this.where,
      include: ["travelAuthorization"],
      order: this.order,
      limit: this.limit,
      offset: this.offset,
    })
    const summaries = await this.computeSummaries(scopedGeneralLedgerCodings, this.where)

    return {
      generalLedgerCodings,
      totalCount,
      summaries,
    }
  }

  private async computeSummaries(
    scopedGeneralLedgerCodings: ModelStatic<GeneralLedgerCoding>,
    where: WhereOptions<Attributes<GeneralLedgerCoding>>
  ): Promise<GeneralLedgerCodingsIndexSummaries> {
    const totalAmount = await this.computeTotalAmount(scopedGeneralLedgerCodings, where)
    return {
      totalAmount,
    }
  }

  /**
   * See https://github.com/sequelize/sequelize/blob/52e3c30d2927879ed47cbcf19f55e5cc10ba3771/packages/core/test/integration/model/scope/aggregate.test.js
   */
  private async computeTotalAmount(
    scopedGeneralLedgerCodings: ModelStatic<GeneralLedgerCoding>,
    where: WhereOptions<Attributes<GeneralLedgerCoding>>
  ): Promise<number> {
    const totalAmount = await scopedGeneralLedgerCodings.aggregate<
      number | null,
      GeneralLedgerCoding
    >("amount", "SUM", {
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
    return totalAmount ?? 0
  }
}

export default IndexService
