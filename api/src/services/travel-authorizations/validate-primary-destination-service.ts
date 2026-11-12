import { Op } from "@sequelize/core"

import { TravelAuthorization, TravelSegment } from "@/models"

import BaseService from "@/services/base-service"

export class ValidatePrimaryDestinationService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorization,
    protected isActual: boolean
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { travelAuthorization, isActual } = this
    const tripType = isActual
      ? (travelAuthorization.tripTypeActual ?? travelAuthorization.tripTypeEstimate)
      : travelAuthorization.tripTypeEstimate
    if (tripType !== TravelAuthorization.TripTypes.MULTI_CITY) {
      return
    }

    const numberOfPrimaryDestinations = await TravelSegment.count({
      where: {
        travelAuthorizationId: travelAuthorization.id,
        isActual,
        isPrimaryDestination: true,
        arrivalLocationId: { [Op.ne]: null },
      },
    })
    if (numberOfPrimaryDestinations !== 1) {
      throw new Error("Select a primary destination for the multi-city itinerary before submitting.")
    }
  }
}

export default ValidatePrimaryDestinationService
