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

    return {
      travelDeskInvoiceId: this.travelDeskInvoiceId,
      productType: item.productType,
      travelDeskFlightSegmentId: item.travelDeskFlightSegmentId ?? null,
      sourceAirSegmentNumber: item.sourceAirSegmentNumber ?? null,
      sourceServiceFeeEventExternalIdentifier: item.sourceServiceFeeEventExternalIdentifier ?? null,
      passengerName: item.passengerName ?? null,
      ticketNumber: item.ticketNumber ?? null,
      vendor: item.vendor ?? null,
      description: item.description ?? null,
      saleType: item.saleType,
      grossAmount,
      position: item.position,
    }
  }
}

export default BulkCreateService
