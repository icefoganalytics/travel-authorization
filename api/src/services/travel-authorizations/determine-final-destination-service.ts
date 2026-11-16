import { first, isNil, isUndefined, last } from "lodash"

import { Location, TravelAuthorization, TravelSegment } from "@/models"

import BaseService from "@/services/base-service"

export class DetermineFinalDestinationService extends BaseService {
  constructor(
    protected tripType: TravelAuthorization["tripType"],
    protected travelSegments: TravelSegment[] | undefined,
    protected tripTypeActual: TravelAuthorization["tripTypeActual"]
  ) {
    super()
  }

  perform(): Location | null {
    const { tripType, travelSegments, tripTypeActual } = this
    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
    }

    for (const travelSegment of travelSegments) {
      if (
        isUndefined(travelSegment.departureLocation) ||
        isUndefined(travelSegment.arrivalLocation)
      ) {
        throw new Error("Expected travel segment locations to be pre-loaded.")
      }
    }

    const useActuals = !isNil(tripTypeActual)
    const destinationTravelSegments = travelSegments.filter(
      (travelSegment) => travelSegment.isActual === useActuals
    )
    const firstTravelSegment = first(destinationTravelSegments)
    const lastTravelSegment = last(destinationTravelSegments)
    const penultimateTravelSegment = destinationTravelSegments.at(-2)

    if (isNil(lastTravelSegment)) return null

    let finalDestinationLocation = lastTravelSegment.arrivalLocation
    if (tripType === TravelAuthorization.TripTypes.ROUND_TRIP) {
      finalDestinationLocation = lastTravelSegment.departureLocation
    } else if (
      tripType === TravelAuthorization.TripTypes.MULTI_CITY &&
      !isNil(penultimateTravelSegment) &&
      !isNil(firstTravelSegment?.departureLocationId) &&
      firstTravelSegment.departureLocationId === lastTravelSegment.arrivalLocationId
    ) {
      finalDestinationLocation = penultimateTravelSegment.arrivalLocation
    }

    if (isNil(finalDestinationLocation)) return null

    return finalDestinationLocation
  }
}

export default DetermineFinalDestinationService
