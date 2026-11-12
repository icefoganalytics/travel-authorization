import { isNil } from "lodash"

import { TravelAuthorizationTripTypes } from "@/api/travel-authorizations-api"
import { type TravelSegment } from "@/api/travel-segments-api"

import determineFinalDestinationSegment from "@/use/travel-authorizations/travel-authorization-summaries/determine-final-destination-segment"

type DestinationSegment = Partial<
  Pick<TravelSegment, "departureLocationId" | "arrivalLocationId" | "isPrimaryDestination">
>

export function determinePrimaryDestinationSegment<Segment extends DestinationSegment>(
  tripType: TravelAuthorizationTripTypes | null | undefined,
  travelSegments: readonly Segment[] | null | undefined
): Segment | undefined {
  if (isNil(travelSegments)) return undefined

  const primaryDestinationSegment = travelSegments.find(
    (segment) => segment.isPrimaryDestination && !isNil(segment.arrivalLocationId)
  )
  if (!isNil(primaryDestinationSegment)) return primaryDestinationSegment

  if (tripType === TravelAuthorizationTripTypes.MULTI_CITY) return undefined

  return determineFinalDestinationSegment(tripType, travelSegments)
}

export default determinePrimaryDestinationSegment
