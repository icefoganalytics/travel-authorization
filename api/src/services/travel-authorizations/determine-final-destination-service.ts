import { isNil, isUndefined } from "lodash"

import { Location, TravelAuthorization, TravelSegment } from "@/models"

import BaseService from "@/services/base-service"
import { defaultPrimaryDestinationSegment } from "@/services/travel-segments/helpers/default-primary-destination-segment"

export class DetermineFinalDestinationService extends BaseService {
  constructor(
    protected tripType: TravelAuthorization["tripType"],
    protected travelSegments: TravelSegment[] | undefined,
    protected tripTypeActual: TravelAuthorization["tripTypeActual"],
    protected estimatedPrimaryDestinationId: number | null,
    protected actualPrimaryDestinationId: number | null
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
    const activeTripType = tripTypeActual ?? tripType
    const destinationTravelSegments = travelSegments.filter(
      (travelSegment) => travelSegment.isActual === useActuals
    )
    let primaryTravelSegment: TravelSegment | undefined
    if (activeTripType === TravelAuthorization.TripTypes.MULTI_CITY) {
      const destinationId = useActuals
        ? this.actualPrimaryDestinationId
        : this.estimatedPrimaryDestinationId
      primaryTravelSegment = destinationTravelSegments.find(
        ({ arrivalLocationId }) => !isNil(destinationId) && arrivalLocationId === destinationId
      )
    } else {
      primaryTravelSegment = defaultPrimaryDestinationSegment(
        activeTripType,
        destinationTravelSegments
      )
    }

    if (isNil(primaryTravelSegment?.arrivalLocation)) {
      return null
    }

    return primaryTravelSegment.arrivalLocation
  }
}

export default DetermineFinalDestinationService
