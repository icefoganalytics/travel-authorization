import { first, isNil, last } from "lodash"

import { TravelSegment, Location } from "@/models"

export function determineFinalDestination(travelSegments: TravelSegment[]): Location {
  const firstTravelSegment = first(travelSegments)
  const lastTravelSegment = last(travelSegments)

  if (isNil(firstTravelSegment)) {
    throw new Error(`Missing first travel segment`)
  }
  if (isNil(lastTravelSegment)) {
    throw new Error(`Missing last travel segment`)
  }

  let finalDestination: Location | undefined

  const isRoundTrip = firstTravelSegment.departureLocationId === lastTravelSegment.arrivalLocationId
  if (isRoundTrip) {
    finalDestination = lastTravelSegment.departureLocation
  } else {
    finalDestination = lastTravelSegment.arrivalLocation
  }

  if (isNil(finalDestination)) {
    throw new Error(
      `Could not determine final destination from travel segments: ${JSON.stringify(
        travelSegments
      )}`
    )
  }

  return finalDestination
}

export default determineFinalDestination
