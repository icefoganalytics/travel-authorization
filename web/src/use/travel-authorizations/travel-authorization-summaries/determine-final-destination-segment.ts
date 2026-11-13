import { first, isEmpty, isNil, last } from "lodash"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

type DestinationSegment = Partial<Pick<TravelSegment, "departureLocationId" | "arrivalLocationId">>

export function determineFinalDestinationSegment<Segment extends DestinationSegment>(
  tripType: TravelAuthorizationTripTypes | null | undefined,
  travelSegments: readonly Segment[] | null | undefined
): Segment | undefined {
  if (isNil(tripType) || isNil(travelSegments) || isEmpty(travelSegments)) return undefined

  const firstTravelSegment = first(travelSegments)
  const lastTravelSegment = last(travelSegments)
  const originLocationId = firstTravelSegment?.departureLocationId
  const returnsToOrigin =
    travelSegments.length > 1 &&
    !isNil(originLocationId) &&
    lastTravelSegment?.arrivalLocationId === originLocationId

  let finalDestinationSegment: Segment | undefined

  if (
    tripType === TravelAuthorizationTripTypes.ROUND_TRIP ||
    (tripType === TravelAuthorizationTripTypes.MULTI_CITY && returnsToOrigin)
  ) {
    finalDestinationSegment = travelSegments.at(-2)
  } else {
    finalDestinationSegment = lastTravelSegment
  }

  return finalDestinationSegment
}

export default determineFinalDestinationSegment
