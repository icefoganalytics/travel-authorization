import { type TravelDeskInvoiceItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskInvoiceItemAsReference = {
  id: number
  travelDeskProductTypeId: number
  travelDeskFlightSegmentId: number | null
  sourceAirSegmentNumber: number | null
  sourceServiceFeeEventId: number | null
  passengerName: string | null
  ticketNumber: string | null
  vendor: string | null
  description: string | null
  saleType: "Sale" | "Refund" | "Void"
  grossAmount: string
  position: number
  productType: {
    id: number
    code: string
    name: string
    description: string | null
  }
}

export class ReferenceSerializer extends BaseSerializer<TravelDeskInvoiceItem> {
  perform(): TravelDeskInvoiceItemAsReference {
    const { productType } = this.record
    if (!productType) {
      throw new Error("Expected invoice item product type to be preloaded.")
    }

    const serializedProductType = {
      id: productType.id,
      code: productType.code,
      name: productType.name,
      description: productType.description,
    }

    return {
      id: this.record.id,
      travelDeskProductTypeId: this.record.travelDeskProductTypeId,
      travelDeskFlightSegmentId: this.record.travelDeskFlightSegmentId,
      sourceAirSegmentNumber: this.record.sourceAirSegmentNumber,
      sourceServiceFeeEventId: this.record.sourceServiceFeeEventId,
      passengerName: this.record.passengerName,
      ticketNumber: this.record.ticketNumber,
      vendor: this.record.vendor,
      description: this.record.description,
      saleType: this.record.saleType,
      grossAmount: this.record.grossAmount,
      position: this.record.position,
      productType: serializedProductType,
    }
  }
}

export default ReferenceSerializer
