import { TravelDeskTravelRequest, User } from "@/models"

import BaseService from "@/services/base-service"

export class OptionsRankedService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    if (this.travelDeskTravelRequest.status !== TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED) {
      throw new Error(
        "Travel desk travel request must be in options provided state to rank options."
      )
    }

    await this.travelDeskTravelRequest.update({
      status: TravelDeskTravelRequest.Statuses.OPTIONS_RANKED,
    })
    return this.travelDeskTravelRequest.reload({
      include: ["travelAuthorization"],
    })
  }
}

export default OptionsRankedService
