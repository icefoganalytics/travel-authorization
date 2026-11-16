import { isNil } from "lodash"

import { TravelAuthorization, TravelSegment } from "@/models"

import BaseService from "@/services/base-service"

export class ValidatePrimaryDestinationService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorization,
    protected isActual: boolean,
    protected requireSelection = true
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { travelAuthorization, isActual, requireSelection } = this
    const tripType = isActual
      ? (travelAuthorization.tripTypeActual ?? travelAuthorization.tripTypeEstimate)
      : travelAuthorization.tripTypeEstimate
    const destinationId = isActual
      ? travelAuthorization.actualPrimaryDestinationId
      : travelAuthorization.estimatedPrimaryDestinationId
    if (isNil(destinationId)) {
      if (requireSelection && tripType === TravelAuthorization.TripTypes.MULTI_CITY) {
        throw new Error(
          "Select a primary destination for the multi-city itinerary before submitting."
        )
      }

      return
    }

    const hasMatchingArrival = await TravelSegment.findOne({
      where: {
        travelAuthorizationId: travelAuthorization.id,
        isActual,
        arrivalLocationId: destinationId,
      },
    })
    if (isNil(hasMatchingArrival)) {
      throw new Error("Primary destination must match an arrival in the corresponding itinerary.")
    }
  }
}

export default ValidatePrimaryDestinationService
