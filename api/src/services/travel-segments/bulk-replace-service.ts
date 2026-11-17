import { Attributes } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import { type WithRequired } from "@/utils/utility-types"

import db, { TravelAuthorization, TravelSegment } from "@/models"
import BaseService from "@/services/base-service"
import { ReconcilePrimaryDestinationService } from "@/services/travel-authorizations/reconcile-primary-destination-service"

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
        ({ travelAuthorizationId }) => travelAuthorizationId !== this.travelAuthorizationId
      )
    ) {
      throw new Error("All travel segments must belong to the same travel authorization.")
    }

    if (this.travelSegmentsAttributes.some(({ isActual }) => isActual !== this.isActual)) {
      throw new Error("All travel segments must have the same isActual value.")
    }

    if (
      this.travelSegmentsAttributes.some(
        ({ departureLocationId, arrivalLocationId }) =>
          !isNil(departureLocationId) &&
          !isNil(arrivalLocationId) &&
          departureLocationId === arrivalLocationId
      )
    ) {
      const prettyTravelSegmentsAttributes = JSON.stringify(this.travelSegmentsAttributes)
      throw new Error(
        `Departure location and arrival location must be different for each travel segment: ${prettyTravelSegmentsAttributes}`
      )
    }

    return db.transaction(async () => {
      const travelAuthorization = await TravelAuthorization.findByPk(this.travelAuthorizationId, {
        rejectOnEmpty: true,
        lock: true,
      })
      const existingTravelSegments = await TravelSegment.findAll({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          isActual: this.isActual,
        },
      })
      for (const { id } of this.travelSegmentsAttributes) {
        if (
          !isUndefined(id) &&
          !existingTravelSegments.some((travelSegment) => travelSegment.id === id)
        ) {
          throw new Error("Replacement segment IDs must belong to the itinerary being replaced.")
        }
      }

      const travelSegmentsAttributes = this.travelSegmentsAttributes
      this.hasAllRequiredAttributes(travelSegmentsAttributes)

      await TravelSegment.destroy({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          isActual: this.isActual,
        },
      })

      const travelSegments = await TravelSegment.bulkCreate(travelSegmentsAttributes)
      await ReconcilePrimaryDestinationService.perform(travelAuthorization, this.isActual)
      return travelSegments
    })
  }

  private hasAllRequiredAttributes(
    travelSegmentsAttributes: TravelSegmentAttributes[]
  ): asserts travelSegmentsAttributes is WithRequired<
    TravelSegmentAttributes,
    "travelAuthorizationId" | "segmentNumber" | "modeOfTransport"
  >[] {
    for (const {
      travelAuthorizationId,
      segmentNumber,
      modeOfTransport,
    } of travelSegmentsAttributes) {
      if (isNil(travelAuthorizationId)) {
        throw new Error("Travel authorization ID is required.")
      }

      if (isNil(segmentNumber)) {
        throw new Error("Segment number is required.")
      }

      if (isNil(modeOfTransport)) {
        throw new Error("Mode of transport is required.")
      }
    }
  }
}
