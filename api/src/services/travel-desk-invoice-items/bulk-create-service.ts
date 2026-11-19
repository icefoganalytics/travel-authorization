import { type CreationAttributes } from "@sequelize/core"

import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { type InvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items-service"
import { normalizeInvoiceAmount } from "@/utils/normalize-invoice-amount"

export class BulkCreateService extends BaseService {
  constructor(
    protected travelDeskInvoiceId: number,
    protected travelDeskInvoiceItemsAttributes: InvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
    const itemCreationAttributes = this.travelDeskInvoiceItemsAttributes.map((itemAttributes) =>
      this.buildItemAttributes(itemAttributes)
    )

    await TravelDeskInvoiceItem.bulkCreate(itemCreationAttributes, {
      validate: true,
    })
  }

  private buildItemAttributes(item: InvoiceItemAttributes): CreationAttributes<TravelDeskInvoiceItem> {
    const grossAmount = normalizeInvoiceAmount(item.grossAmount)
    const travelDeskFlightSegmentId = item.travelDeskFlightSegmentId ?? null
    const sourceAirSegmentNumber = item.sourceAirSegmentNumber ?? null
    const sourceServiceFeeEventExternalIdentifier = item.sourceServiceFeeEventExternalIdentifier ?? null
    const passengerName = item.passengerName ?? null
    const ticketNumber = item.ticketNumber ?? null
    const vendor = item.vendor ?? null
    const description = item.description ?? null

    return {
      travelDeskInvoiceId: this.travelDeskInvoiceId,
      productType: item.productType,
      travelDeskFlightSegmentId,
      sourceAirSegmentNumber,
      sourceServiceFeeEventExternalIdentifier,
      passengerName,
      ticketNumber,
      vendor,
      description,
      saleType: item.saleType,
      grossAmount,
      position: item.position,
    }
  }
}

export default BulkCreateService
