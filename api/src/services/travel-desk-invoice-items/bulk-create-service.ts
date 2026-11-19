import { pick } from "lodash"

import normalizeInvoiceAmount from "@/utils/normalize-invoice-amount"
import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items-service"

export class BulkCreateService extends BaseService {
  constructor(
    protected travelDeskInvoiceId: number,
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
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
          "position",
        ]),
        travelDeskInvoiceId: this.travelDeskInvoiceId,
        grossAmount: normalizeInvoiceAmount(travelDeskInvoiceItemAttributes.grossAmount),
      })
    )

    await TravelDeskInvoiceItem.bulkCreate(travelDeskInvoiceItemCreationAttributes, {
      validate: true,
    })
  }
}

export default BulkCreateService
