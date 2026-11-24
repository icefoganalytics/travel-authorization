import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-travel-desk-invoice-items-service"

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
        productType: travelDeskInvoiceItemAttributes.productType,
        travelDeskFlightSegmentId: travelDeskInvoiceItemAttributes.travelDeskFlightSegmentId,
        sourceAirSegmentNumber: travelDeskInvoiceItemAttributes.sourceAirSegmentNumber,
        sourceServiceFeeEventExternalIdentifier:
          travelDeskInvoiceItemAttributes.sourceServiceFeeEventExternalIdentifier,
        passengerName: travelDeskInvoiceItemAttributes.passengerName,
        ticketNumber: travelDeskInvoiceItemAttributes.ticketNumber,
        vendor: travelDeskInvoiceItemAttributes.vendor,
        description: travelDeskInvoiceItemAttributes.description,
        saleType: travelDeskInvoiceItemAttributes.saleType,
        grossAmount: travelDeskInvoiceItemAttributes.grossAmount,
        position: travelDeskInvoiceItemAttributes.position,
        travelDeskInvoiceId: this.travelDeskInvoiceId,
      })
    )

    await TravelDeskInvoiceItem.bulkCreate(travelDeskInvoiceItemCreationAttributes, {
      validate: true,
    })
  }
}

export default BulkCreateService
