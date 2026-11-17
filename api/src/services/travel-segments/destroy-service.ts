import { isUndefined } from "lodash"

import db, { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"
import { ReconcilePrimaryDestinationService } from "@/services/travel-authorizations/reconcile-primary-destination-service"

export class DestroyService extends BaseService {
  constructor(
    protected travelSegment: TravelSegment,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    return db.transaction(async () => {
      const { travelAuthorization: loadedTravelAuthorization, travelAuthorizationId } =
        this.travelSegment
      if (isUndefined(loadedTravelAuthorization)) {
        throw new Error("Travel authorization must be pre-loaded.")
      }

      const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
        rejectOnEmpty: true,
        lock: true,
      })
      const { isActual } = this.travelSegment
      const tripType = isActual
        ? travelAuthorization.tripTypeActual
        : travelAuthorization.tripTypeEstimate
      const numberOfTravelSegments = await TravelSegment.count({
        where: {
          travelAuthorizationId,
          isActual,
        },
      })
      if (tripType === TravelAuthorization.TripTypes.ONE_WAY && numberOfTravelSegments <= 1) {
        throw new Error(
          "Travel segment cannot be deleted when trip type is one way and there is only one travel segment."
        )
      } else if (
        tripType === TravelAuthorization.TripTypes.MULTI_CITY &&
        numberOfTravelSegments <= 2
      ) {
        throw new Error(
          "Travel segment cannot be deleted when trip type is multi-city and there are only two travel segments."
        )
      } else if (
        tripType === TravelAuthorization.TripTypes.ROUND_TRIP &&
        numberOfTravelSegments <= 2
      ) {
        throw new Error(
          "Travel segment cannot be deleted when trip type is round trip and there are only two travel segments."
        )
      }

      const numberOfExpenses = await Expense.count({
        where: {
          type: Expense.Types.EXPENSE,
          travelAuthorizationId,
        },
      })
      if (numberOfExpenses > 0) {
        throw new Error("Travel segment cannot be deleted when there are dependent expenses.")
      }

      await this.travelSegment.destroy()
      await ReconcilePrimaryDestinationService.perform(travelAuthorization, isActual)
    })
  }
}

export default DestroyService
