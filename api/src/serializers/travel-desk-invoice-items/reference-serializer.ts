import { type TravelDeskInvoiceItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskInvoiceItemAsReference = Pick<
  TravelDeskInvoiceItem,
  | "id"
  | "productType"
  | "travelDeskFlightSegmentId"
  | "sourceAirSegmentNumber"
  | "sourceServiceFeeEventExternalIdentifier"
  | "passengerName"
  | "ticketNumber"
  | "vendor"
  | "description"
  | "saleType"
  | "grossAmount"
  | "position"
>

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
