import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import { UpsertService } from "@/services/travel-desk-travel-requests/passenger-name-record-document"
import BaseController from "@/controllers/base-controller"

export class PassengerNameRecordDocumentController extends BaseController {
  async create() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to upload Passenger Name Record (PNR) documents to this travel request.",
        })
      }

      // Info on file format: https://github.com/expressjs/multer#file-information
      // See https://github.com/richardgirges/express-fileupload/blob/98028e91d11b368df53ada2a183ecd863737baa4/lib/fileFactory.js#L54
      const { files } = this.request
      if (isNil(files)) {
        return this.response.status(422).json({
          message: "No Passenger Name Record (PNR) document was uploaded.",
        })
      }

      // must match field name in web/src/api/travel-desk-travel-requests/passenger-name-record-documents-api.ts#create
      const { content } = files
      if (isNil(content)) {
        return this.response.status(422).json({
          message: "No Passenger Name Record (PNR) document was uploaded.",
        })
      }

      if (Array.isArray(content)) {
        return this.response.status(422).json({
          message: "Only one Passenger Name Record (PNR) document can be uploaded at a time.",
        })
      }

      const { tempFilePath } = content

      const passengerNameRecordDocument = await UpsertService.perform(
        travelDeskTravelRequest,
        tempFilePath
      )

      return this.response.status(201).json({
        passengerNameRecordDocument,
      })
    } catch (error) {
      logger.error(`Error creating Passenger Name Record (PNR) document: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to create Passenger Name Record (PNR) document: ${error}`,
      })
    }
  }

  private loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    return TravelDeskTravelRequest.findByPk(this.params.travelDeskTravelRequestId, {
      include: ["travelAuthorization"],
    })
  }

  private buildPolicy(
    travelDeskTravelRequest: TravelDeskTravelRequest
  ): TravelDeskTravelRequestsPolicy {
    return new TravelDeskTravelRequestsPolicy(this.currentUser, travelDeskTravelRequest)
  }
}

export default PassengerNameRecordDocumentController
