import { isUndefined } from "lodash"

import type { Stop, TravelAuthorization, TravelDeskTravelRequest, TravelSegment } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelAuthorizationAsIndex = Pick<
  TravelAuthorization,
  "id" | "firstName" | "lastName" | "status"
> & {
  purposeText: string
  departingAt: string | null
  returningAt: string | null
  locationIds: number[]
  travelDeskTravelRequest: Pick<TravelDeskTravelRequest, "id" | "status" | "invoiceNumber"> | null
}

export class IndexSerializer extends BaseSerializer<TravelAuthorization> {
  perform(): TravelDeskTravelAuthorizationAsIndex {
    const { purpose, stops, travelDeskTravelRequest, travelSegments } = this.record
    if (isUndefined(purpose)) {
      throw new Error("Expected purpose association to be preloaded.")
    }

    if (isUndefined(stops)) {
      throw new Error("Expected stops association to be preloaded.")
    }

    if (isUndefined(travelDeskTravelRequest)) {
      throw new Error("Expected travel desk travel request association to be preloaded.")
    }

    if (isUndefined(travelSegments)) {
      throw new Error("Expected travel segments association to be preloaded.")
    }

    const firstTravelSegment = travelSegments[0]
    const lastTravelSegment = travelSegments[travelSegments.length - 1]
    const firstStop = stops[0]
    const lastStop = stops[stops.length - 1]
    const departingAt = firstTravelSegment?.departureAt ?? firstStop?.departureAt ?? null
    const returningAt = lastTravelSegment?.departureAt ?? lastStop?.departureAt ?? null
    const locationIds = this.buildLocationIds(travelSegments, stops)

    return {
      id: this.record.id,
      firstName: this.record.firstName,
      lastName: this.record.lastName,
      status: this.record.status,
      purposeText: purpose?.purpose ?? "",
      departingAt: departingAt?.toISOString() ?? null,
      returningAt: returningAt?.toISOString() ?? null,
      locationIds,
      travelDeskTravelRequest: travelDeskTravelRequest
        ? {
            id: travelDeskTravelRequest.id,
            status: travelDeskTravelRequest.status,
            invoiceNumber: travelDeskTravelRequest.invoiceNumber,
          }
        : null,
    }
  }

  private buildLocationIds(travelSegments: TravelSegment[], stops: Stop[]): number[] {
    const locationIds = new Set<number>()

    if (travelSegments.length > 0) {
      for (const travelSegment of travelSegments) {
        if (travelSegment.departureLocationId !== null) {
          locationIds.add(travelSegment.departureLocationId)
        }

        if (travelSegment.arrivalLocationId !== null) {
          locationIds.add(travelSegment.arrivalLocationId)
        }
      }
    } else {
      for (const stop of stops) {
        if (stop.locationId !== null) {
          locationIds.add(stop.locationId)
        }
      }
    }

    return Array.from(locationIds)
  }
}

export default IndexSerializer
