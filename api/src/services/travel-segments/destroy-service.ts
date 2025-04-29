import { isUndefined } from "lodash"

import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    protected travelSegment: TravelSegment,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { travelAuthorization, travelAuthorizationId } = this.travelSegment
    if (isUndefined(travelAuthorization)) {
      throw new Error("Travel authorization must be pre-loaded.")
    }

    const numberOfTravelSegments = await TravelSegment.count({
      where: {
        travelAuthorizationId,
      },
    })
    if (
      travelAuthorization.tripType === TravelAuthorization.TripTypes.ONE_WAY &&
      numberOfTravelSegments <= 1
    ) {
      throw new Error(
        "Travel segment cannot be deleted when trip type is one way and there is only one travel segment."
      )
    } else if (
      travelAuthorization.tripType === TravelAuthorization.TripTypes.MULTI_CITY &&
      numberOfTravelSegments <= 2
    ) {
      throw new Error(
        "Travel segment cannot be deleted when trip type is multi-city and there are only two travel segments."
      )
    } else if (
      travelAuthorization.tripType === TravelAuthorization.TripTypes.ROUND_TRIP &&
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
    return
  }
}

export default DestroyService
