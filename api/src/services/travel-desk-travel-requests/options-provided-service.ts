import { isUndefined } from "lodash"

import db, { TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskTravelRequest>

export class OptionsProvidedService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    if (this.travelDeskTravelRequest.status !== TravelDeskTravelRequest.Statuses.SUBMITTED) {
      throw new Error("Travel desk travel request must be in submitted state to provide options.")
    }

    return db.transaction(async () => {
      await this.travelDeskTravelRequest.update({
        ...this.attributes,
        status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
      })

      const { travelAuthorization } = this.travelDeskTravelRequest
      if (isUndefined(travelAuthorization)) {
        throw new Error("Expected travelAuthorization association to be pre-loaded.")
      }

      await travelAuthorization.update({
        wizardStepName: TravelAuthorization.WizardStepNames.RANK_FLIGHT_OPTIONS,
      })

      return this.travelDeskTravelRequest.reload({
        include: ["travelAuthorization"],
      })
    })
  }
}

export default OptionsProvidedService
