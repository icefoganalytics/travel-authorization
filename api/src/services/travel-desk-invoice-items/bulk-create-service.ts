import { pick } from "lodash"

import { type TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { ValidateLinkedTravelDeskFlightSegmentsService } from "@/services/travel-desk-invoice-items/validate-linked-travel-desk-flight-segments-service"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoice-items/validate-travel-desk-invoice-items-service"

export class BulkCreateService extends BaseService {
  constructor(
    protected travelDeskInvoice: TravelDeskInvoice,
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
    await ValidateLinkedTravelDeskFlightSegmentsService.perform(
      this.travelDeskInvoice.travelDeskTravelRequestId,
      this.travelDeskInvoiceItemsAttributes
    )

    const travelDeskInvoiceItemCreationAttributes = this.travelDeskInvoiceItemsAttributes.map(
      (travelDeskInvoiceItemAttributes) => ({
        ...pick(travelDeskInvoiceItemAttributes, [
          "productType",
          "travelDeskFlightSegmentId",
          "sourceAirSegmentNumber",
          "sourceServiceFeeEventExternalIdentifier",
          "passengerName",
          "ticketNumber",
          "vendor",
          "description",
          "saleType",
          "grossAmount",
          "position",
        ]),
        travelDeskInvoiceId: this.travelDeskInvoice.id,
      })
    )

    await TravelDeskInvoiceItem.bulkCreate(travelDeskInvoiceItemCreationAttributes, {
      validate: true,
    })
  }
}

export default BulkCreateService
