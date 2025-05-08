import { Attributes } from "sequelize"
import { isNil } from "lodash"

import { transaction } from "@/utils/transaction"
import { type WithRequired } from "@/utils/utility-types"

import { TravelSegment } from "@/models"
import BaseService from "@/services/base-service"

export type TravelSegmentAttributes = Partial<Attributes<TravelSegment>>

export class BulkReplaceService extends BaseService {
  constructor(
    protected travelAuthorizationId: number,
    protected travelSegmentsAttributes: TravelSegmentAttributes[],
    protected isActual: boolean
  ) {
    super()
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

    if (
      this.travelSegmentsAttributes.some(
        (travelSegmentAttributes) => travelSegmentAttributes.isActual !== this.isActual
      )
    ) {
      throw new Error("All travel segments must have the same isActual value.")
    }

    if (
      this.travelSegmentsAttributes.some(
        (travelSegmentAttributes) =>
          travelSegmentAttributes.departureLocationId === travelSegmentAttributes.arrivalLocationId
      )
    ) {
      const prettyTravelSegmentsAttributes = JSON.stringify(this.travelSegmentsAttributes)
      throw new Error(
        `Departure location and arrival location must be different for each travel segment: ${prettyTravelSegmentsAttributes}`
      )
    }

    return transaction(async () => {
      await TravelSegment.destroy({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          isActual: this.isActual,
        },
      })

      this.hasAllRequiredAttributes(this.travelSegmentsAttributes)
      return TravelSegment.bulkCreate(this.travelSegmentsAttributes)
    })
  }

  private hasAllRequiredAttributes(
    travelSegmentsAttributes: TravelSegmentAttributes[]
  ): asserts travelSegmentsAttributes is WithRequired<
    TravelSegmentAttributes,
    "segmentNumber" | "modeOfTransport"
  >[] {
    for (const { segmentNumber, modeOfTransport } of travelSegmentsAttributes) {
      if (isNil(segmentNumber)) {
        throw new Error("Segment number is required.")
      }

      if (isNil(modeOfTransport)) {
        throw new Error("Mode of transport is required.")
      }
    }
  }
}
