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

  private async computeTotalAmount(
    scopedGeneralLedgerCodings: ModelStatic<GeneralLedgerCoding>,
    where: WhereOptions<Attributes<GeneralLedgerCoding>>
  ): Promise<number> {
    const totalAmount = await scopedGeneralLedgerCodings.sum("amount", {
      where,
    })
    return totalAmount ?? 0
  }
}

export default IndexService
