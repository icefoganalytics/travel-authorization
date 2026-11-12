import { Attributes } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import { type WithRequired } from "@/utils/utility-types"

import db, { TravelAuthorization, TravelSegment } from "@/models"
import BaseService from "@/services/base-service"
import { defaultPrimaryDestinationSegment } from "@/services/travel-segments/default-primary-destination-segment"

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

    const selectedTravelSegments = this.travelSegmentsAttributes.filter(
      ({ isPrimaryDestination }) => isPrimaryDestination === true
    )
    if (selectedTravelSegments.length > 1) {
      throw new Error("Only one primary destination may be selected per itinerary.")
    }

    if (selectedTravelSegments.some(({ arrivalLocationId }) => isNil(arrivalLocationId))) {
      throw new Error("Primary destination requires an arrival location.")
    }

    const travelSegmentsAttributes = this.travelSegmentsAttributes.map((attributes) => ({
      ...attributes,
    }))
    this.hasAllRequiredAttributes(travelSegmentsAttributes)
    if (
      travelSegmentsAttributes.every(({ isPrimaryDestination }) =>
        isUndefined(isPrimaryDestination)
      )
    ) {
      const travelAuthorization = await TravelAuthorization.findByPk(this.travelAuthorizationId, {
        rejectOnEmpty: true,
      })
      const tripType = this.isActual
        ? travelAuthorization.tripTypeActual
        : travelAuthorization.tripTypeEstimate
      const primaryTravelSegment = defaultPrimaryDestinationSegment(
        tripType,
        travelSegmentsAttributes
      )
      if (!isUndefined(primaryTravelSegment)) {
        primaryTravelSegment.isPrimaryDestination = true
      }
    }

    return db.transaction(async () => {
      await TravelSegment.destroy({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          isActual: this.isActual,
        },
      })

      return TravelSegment.bulkCreate(travelSegmentsAttributes)
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
