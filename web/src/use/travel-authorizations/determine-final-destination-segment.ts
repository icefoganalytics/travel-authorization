import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

type DestinationSegment = Partial<Pick<TravelSegment, "departureLocationId" | "arrivalLocationId">>

// Callers supply itinerary order, as returned by the segmentNumber-ordered API.
export function determineFinalDestinationSegment<Segment extends DestinationSegment>(
  tripType: TravelAuthorizationTripTypes | null | undefined,
  travelSegments: readonly Segment[] | null | undefined
): Segment | undefined {
  if (tripType == null || travelSegments == null) return undefined

  const firstSegment = travelSegments.at(0)
  const lastSegment = travelSegments.at(-1)
  const originLocationId = firstSegment?.departureLocationId
  const returnsToOrigin =
    travelSegments.length > 1 &&
    originLocationId != null &&
    lastSegment?.arrivalLocationId === originLocationId

  if (
    tripType === TravelAuthorizationTripTypes.ROUND_TRIP ||
    (tripType === TravelAuthorizationTripTypes.MULTI_CITY && returnsToOrigin)
  ) {
    return travelSegments.at(-2)
  }

  return lastSegment
}

export default determineFinalDestinationSegment
