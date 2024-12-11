import { isNil } from "lodash"

import { TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequests } from "@/policies"
import { OptionsRankedService } from "@/services/travel-desk-travel-requests"

import BaseController from "@/controllers/base-controller"

export class OptionsRankedController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({ message: "Travel desk request not found." })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to rank options for this travel desk request.",
        })
      }

      const updatedTravelDeskTravelRequest = await OptionsRankedService.perform(
        travelDeskTravelRequest,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskTravelRequest: updatedTravelDeskTravelRequest,
      })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Failed to rank options for travel desk request: ${error}` })
    }
  }

  private async loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    const { travelDeskTravelRequestId } = this.params
    return TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId, {
      include: ["travelAuthorization"],
    })
  }

  private buildPolicy(
    travelDeskTravelRequest: TravelDeskTravelRequest
  ): TravelDeskTravelRequests.OptionsRankedPolicy {
    return new TravelDeskTravelRequests.OptionsRankedPolicy(
      this.currentUser,
      travelDeskTravelRequest
    )
  }
}

export default OptionsRankedController
