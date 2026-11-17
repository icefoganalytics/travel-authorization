import { type TravelDeskInvoiceItem } from "@/models"
import { type TravelDeskInvoiceItemProductTypes } from "@/models/travel-desk-invoice-item"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskInvoiceItemAsReference = {
  id: number
  productType: `${TravelDeskInvoiceItemProductTypes}`
  travelDeskFlightSegmentId: number | null
  sourceAirSegmentNumber: number | null
  sourceServiceFeeEventExternalIdentifier: number | null
  passengerName: string | null
  ticketNumber: string | null
  vendor: string | null
  description: string | null
  saleType: "Sale" | "Refund" | "Void"
  grossAmount: string
  position: number
}

export class ReferenceSerializer extends BaseSerializer<TravelDeskInvoiceItem> {
  perform(): TravelDeskInvoiceItemAsReference {
    return {
      id: this.record.id,
      productType: this.record.productType,
      travelDeskFlightSegmentId: this.record.travelDeskFlightSegmentId,
      sourceAirSegmentNumber: this.record.sourceAirSegmentNumber,
      sourceServiceFeeEventExternalIdentifier: this.record.sourceServiceFeeEventExternalIdentifier,
      passengerName: this.record.passengerName,
      ticketNumber: this.record.ticketNumber,
      vendor: this.record.vendor,
      description: this.record.description,
      saleType: this.record.saleType,
      grossAmount: this.record.grossAmount,
      position: this.record.position,
    }
  }
}

export default ReferenceSerializer
