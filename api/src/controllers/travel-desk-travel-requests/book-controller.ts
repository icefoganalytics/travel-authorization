import { isNil } from "lodash"

import { TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequests } from "@/policies"
import { BookService } from "@/services/travel-desk-travel-requests"
import { ShowSerializer } from "@/serializers/travel-desk-travel-requests"

import BaseController from "@/controllers/base-controller"

export class BookController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({ message: "Travel desk request not found." })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to book this travel desk request." })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskTravelRequest = await BookService.perform(
        travelDeskTravelRequest,
        permittedAttributes,
        this.currentUser
      )
      const updatedTravelDeskTravelRequestWithDocument =
        await updatedTravelDeskTravelRequest.reload({
          include: ["passengerNameRecordDocument"],
        })
      const serializedTravelDeskTravelRequest = ShowSerializer.perform(
        updatedTravelDeskTravelRequestWithDocument,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskTravelRequest: serializedTravelDeskTravelRequest,
      })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Failed to book travel desk request: ${error}` })
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
  ): TravelDeskTravelRequests.BookPolicy {
    return new TravelDeskTravelRequests.BookPolicy(this.currentUser, travelDeskTravelRequest)
  }
}

export default BookController
