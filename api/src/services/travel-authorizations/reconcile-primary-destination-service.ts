import { isNil } from "lodash"

import { TravelAuthorization, TravelSegment } from "@/models"
import BaseService from "@/services/base-service"
import { defaultPrimaryDestinationSegment } from "@/services/travel-segments/helpers/default-primary-destination-segment"

// The caller holds the authorization lock and owns the itinerary mutation transaction.
export class ReconcilePrimaryDestinationService extends BaseService {
  constructor(
    protected travelAuthorization: TravelAuthorization,
    protected isActual: boolean
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { travelAuthorization, isActual } = this
    const destinationAttribute = isActual
      ? "actualPrimaryDestinationId"
      : "estimatedPrimaryDestinationId"
    const destinationId = travelAuthorization[destinationAttribute]
    const travelSegments = await TravelSegment.findAll({
      where: {
        travelAuthorizationId: travelAuthorization.id,
        isActual,
      },
    })
    const tripType = isActual
      ? travelAuthorization.tripTypeActual
      : travelAuthorization.tripTypeEstimate
    let reconciledDestinationId: number | null
    if (tripType === TravelAuthorization.TripTypes.MULTI_CITY) {
      const hasMatchingArrival = travelSegments.some(
        ({ arrivalLocationId }) => !isNil(destinationId) && arrivalLocationId === destinationId
      )
      reconciledDestinationId = hasMatchingArrival ? destinationId : null
    } else {
      const defaultSegment = defaultPrimaryDestinationSegment(tripType, travelSegments)
      reconciledDestinationId = defaultSegment?.arrivalLocationId ?? null
    }

    if (destinationId !== reconciledDestinationId) {
      await travelAuthorization.update({ [destinationAttribute]: reconciledDestinationId })
    }
  }
}

export default ReconcilePrimaryDestinationService
