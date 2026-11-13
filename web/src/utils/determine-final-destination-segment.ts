import { first, isEmpty, isNil, last } from "lodash"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

type DestinationSegment = Partial<Pick<TravelSegment, "departureLocationId" | "arrivalLocationId">>

export function determineFinalDestinationSegment<Segment extends DestinationSegment>(
  tripType: TravelAuthorizationTripTypes | null | undefined,
  travelSegments: readonly Segment[] | null | undefined
): Segment | undefined {
  if (isNil(tripType) || isNil(travelSegments) || isEmpty(travelSegments)) return undefined

  if (tripType === TravelAuthorizationTripTypes.ROUND_TRIP) {
    return travelSegments.at(-2)
  }

  const lastTravelSegment = last(travelSegments)
  if (isNil(lastTravelSegment)) return undefined

  if (tripType !== TravelAuthorizationTripTypes.MULTI_CITY || travelSegments.length < 2) {
    return lastTravelSegment
  }

  const firstTravelSegment = first(travelSegments)
  if (isNil(firstTravelSegment)) return lastTravelSegment

  const originLocationId = firstTravelSegment.departureLocationId
  if (isNil(originLocationId)) return lastTravelSegment

  if (lastTravelSegment.arrivalLocationId === originLocationId) {
    return travelSegments.at(-2)
  }

  return lastTravelSegment
}

export default determineFinalDestinationSegment
