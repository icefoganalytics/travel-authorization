import { type CreationAttributes } from "@sequelize/core"

import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { type InvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items"
import { normalizeInvoiceAmount } from "@/utils/normalize-invoice-amount"

export class BulkCreateService extends BaseService {
  constructor(
    protected travelDeskInvoiceId: number,
    protected items: InvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
    const itemAttributes = this.items.map((item) => this.buildItemAttributes(item))

    await TravelDeskInvoiceItem.bulkCreate(itemAttributes, {
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
