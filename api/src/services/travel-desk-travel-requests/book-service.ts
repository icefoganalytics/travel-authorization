import { isUndefined } from "lodash"

import db, { TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskTravelRequest>

export class BookService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    if (this.travelDeskTravelRequest.status !== TravelDeskTravelRequest.Statuses.OPTIONS_RANKED) {
      throw new Error(
        "Travel desk travel request must be in options ranked state to complete booking."
      )
    }

    return db.transaction(async () => {
      await this.travelDeskTravelRequest.update({
        ...this.attributes,
        status: TravelDeskTravelRequest.Statuses.BOOKED,
      })

      const { travelAuthorization } = this.travelDeskTravelRequest
      if (isUndefined(travelAuthorization)) {
        throw new Error("Expected travelAuthorization association to be pre-loaded.")
      }

      await travelAuthorization.update({
        wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_TRAVEL_START,
      })

      return this.travelDeskTravelRequest.reload({
        include: ["travelAuthorization"],
      })
    })
  }
}

export default BookService
