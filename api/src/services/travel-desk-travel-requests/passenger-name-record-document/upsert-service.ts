import { isNil, truncate } from "lodash"
import { DateTime } from "luxon"

import sanitizeForFileName from "@/utils/sanitize-for-file-name"

import { Attachment, TravelDeskTravelRequest } from "@/models"
import BaseService from "@/services/base-service"
import { Attachments } from "@/services"

export class UpsertService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected filePath: string
  ) {
    super()
  }

  async perform(): Promise<Attachment> {
    const fileName = this.buildFileName()

    return Attachments.UpsertService.perform(this.filePath, fileName, {
      targetId: this.travelDeskTravelRequest.id,
      targetType: Attachment.TargetTypes.TravelDeskTravelRequest,
    })
  }

  private buildFileName(): string {
    const { legalLastName, invoiceNumber } = this.travelDeskTravelRequest
    const safeLegalLastName = truncate(sanitizeForFileName(legalLastName), {
      length: 60,
      separator: /,? +/,
      omission: "",
    })

    const date = DateTime.now().toFormat("yyyy-MM-dd")

    if (!isNil(invoiceNumber)) {
      return `Passenger Name Record, ${safeLegalLastName} - ${invoiceNumber}, ${date}`
    }

    return `Passenger Name Record, ${safeLegalLastName}, ${date}`
  }
}

export default UpsertService
