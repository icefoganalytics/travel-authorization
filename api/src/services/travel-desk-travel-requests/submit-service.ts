import db, { TravelDeskTravelRequest, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskTravelRequest>

export class SubmitService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    if (this.travelDeskTravelRequest.status !== TravelDeskTravelRequest.Statuses.DRAFT) {
      throw new Error("Travel desk travel request must be in draft state to be submitted.")
    }

    return db.transaction(async () => {
      await this.travelDeskTravelRequest.update({
        ...this.attributes,
        status: TravelDeskTravelRequest.Statuses.SUBMITTED,
      })

      return this.travelDeskTravelRequest.reload({
        include: ["travelAuthorization", "passengerNameRecordDocument"],
      })
    })
  }
}

export default SubmitService
