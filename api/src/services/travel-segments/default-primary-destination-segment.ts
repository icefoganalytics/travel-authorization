import { isNil, maxBy, minBy } from "lodash"

import { TravelAuthorization } from "@/models"

// This ordinary simple-trip default never confirms a multi-city destination.
export function defaultPrimaryDestinationSegment<
  Segment extends { segmentNumber?: number; arrivalLocationId?: number | null },
>(tripType: TravelAuthorization["tripType"], travelSegments: Segment[]): Segment | undefined {
  let travelSegment: Segment | undefined
  if (tripType === TravelAuthorization.TripTypes.ROUND_TRIP) {
    travelSegment = minBy(travelSegments, "segmentNumber")
  } else if (tripType === TravelAuthorization.TripTypes.ONE_WAY) {
    travelSegment = maxBy(travelSegments, "segmentNumber")
  }

  if (isNil(travelSegment?.arrivalLocationId)) return undefined

  return travelSegment
}
