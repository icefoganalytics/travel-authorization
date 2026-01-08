import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Attachment, TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class PassengerNameRecordDocumentController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    return this.show()
  }

  async show() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to download this Passenger Name Record (PNR) document.",
        })
      }

      const passengerNameRecordDocument = await this.loadPassengerNameRecordDocument()
      if (isNil(passengerNameRecordDocument)) {
        return this.response.status(404).json({
          message:
            "This travel request does not have an associated Passenger Name Record (PNR) document.",
        })
      }

      const { name, content, mimeType } = passengerNameRecordDocument
      return this.response.status(200).type(mimeType).attachment(name).send(content)
    } catch (error) {
      logger.error(`Error downloading Passenger Name Record (PNR) document: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Failed to download Passenger Name Record (PNR) document: ${error}`,
      })
    }
  }

  private async loadTravelDeskTravelRequest() {
    return TravelDeskTravelRequest.findByPk(this.params.travelDeskTravelRequestId, {
      include: ["travelAuthorization"],
    })
  }

  private async loadPassengerNameRecordDocument() {
    return Attachment.withScope("withContent").findOne({
      where: {
        targetId: this.params.travelDeskTravelRequestId,
        targetType: Attachment.TargetTypes.TravelDeskTravelRequest,
      },
    })
  }

  private buildPolicy(travelDeskTravelRequest: TravelDeskTravelRequest) {
    return new TravelDeskTravelRequestsPolicy(this.currentUser, travelDeskTravelRequest)
  }
}

export default PassengerNameRecordDocumentController
