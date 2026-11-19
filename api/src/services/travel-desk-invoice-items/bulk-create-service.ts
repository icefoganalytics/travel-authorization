import { type CreationAttributes } from "@sequelize/core"

import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoices/validate-items-service"
import { normalizeInvoiceAmount } from "@/utils/normalize-invoice-amount"

export class BulkCreateService extends BaseService {
  constructor(
    protected travelDeskInvoiceId: number,
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ) {
    super()
  }

  async perform(): Promise<void> {
    const travelDeskInvoiceItemCreationAttributes = this.travelDeskInvoiceItemsAttributes.map((travelDeskInvoiceItemAttributes) =>
      this.buildTravelDeskInvoiceItemAttributes(travelDeskInvoiceItemAttributes)
    )

    await TravelDeskInvoiceItem.bulkCreate(travelDeskInvoiceItemCreationAttributes, {
      validate: true,
    })
  }

  private buildTravelDeskInvoiceItemAttributes(travelDeskInvoiceItemAttributes: TravelDeskInvoiceItemAttributes): CreationAttributes<TravelDeskInvoiceItem> {
    const grossAmount = normalizeInvoiceAmount(travelDeskInvoiceItemAttributes.grossAmount)
    const travelDeskFlightSegmentId = travelDeskInvoiceItemAttributes.travelDeskFlightSegmentId ?? null
    const sourceAirSegmentNumber = travelDeskInvoiceItemAttributes.sourceAirSegmentNumber ?? null
    const sourceServiceFeeEventExternalIdentifier = travelDeskInvoiceItemAttributes.sourceServiceFeeEventExternalIdentifier ?? null
    const passengerName = travelDeskInvoiceItemAttributes.passengerName ?? null
    const ticketNumber = travelDeskInvoiceItemAttributes.ticketNumber ?? null
    const vendor = travelDeskInvoiceItemAttributes.vendor ?? null
    const description = travelDeskInvoiceItemAttributes.description ?? null

    return {
      travelDeskInvoiceId: this.travelDeskInvoiceId,
      productType: travelDeskInvoiceItemAttributes.productType,
      travelDeskFlightSegmentId,
      sourceAirSegmentNumber,
      sourceServiceFeeEventExternalIdentifier,
      passengerName,
      ticketNumber,
      vendor,
      description,
      saleType: travelDeskInvoiceItemAttributes.saleType,
      grossAmount,
      position: travelDeskInvoiceItemAttributes.position,
    }
  }
}

export default BulkCreateService
