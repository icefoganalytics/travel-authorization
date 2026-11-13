import { first, isNil, isUndefined, last } from "lodash"

import { TravelAuthorization } from "@/models"

import BaseSerializer from "@/serializers/base-serializer"
import { Locations } from "@/serializers"

export class FinalDestinationSerializer extends BaseSerializer<TravelAuthorization> {
  perform(): Locations.AsReference | null {
    const { travelSegments, tripType, tripTypeActual } = this.record
    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
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

    if (isUndefined(finalDestinationLocation)) {
      throw new Error("Expected travel segment locations to be pre-loaded.")
    }

    if (isNil(finalDestinationLocation)) return null

    return Locations.ReferenceSerializer.perform(finalDestinationLocation)
  }
}

export default FinalDestinationSerializer
