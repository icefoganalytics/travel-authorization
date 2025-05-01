import { CreationAttributes } from "sequelize"

import { transaction } from "@/utils/transaction"
import BaseService from "@/services/base-service"

import { TravelSegment } from "@/models"

export class BulkReplaceService extends BaseService {
  private travelAuthorizationId: number
  private travelSegmentsAttributes: CreationAttributes<TravelSegment>[]

  constructor(
    travelAuthorizationId: number,
    travelSegmentsAttributes: CreationAttributes<TravelSegment>[]
  ) {
    super()
    this.travelAuthorizationId = travelAuthorizationId
    this.travelSegmentsAttributes = travelSegmentsAttributes
  }

  async perform(): Promise<TravelSegment[]> {
    if (
      this.travelSegmentsAttributes.some(
        (travelSegmentAttributes) =>
          travelSegmentAttributes.travelAuthorizationId !== this.travelAuthorizationId
      )
    ) {
      throw new Error("All travel segments must belong to the same travel authorization.")
    }

    const isActualBase = this.travelSegmentsAttributes[0].isActual
    if (
      this.travelSegmentsAttributes.some(
        (travelSegmentAttributes) => travelSegmentAttributes.isActual !== isActualBase
      )
    ) {
      throw new Error("All travel segments must have the same isActual value.")
    }

    return transaction(async () => {
      await TravelSegment.destroy({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          isActual: isActualBase,
        },
      })
      return TravelSegment.bulkCreate(this.travelSegmentsAttributes)
    })
  }
}

export default BulkReplaceService
