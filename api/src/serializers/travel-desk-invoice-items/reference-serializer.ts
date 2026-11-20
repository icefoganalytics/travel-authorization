import { pick } from "lodash"

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
      ...pick(this.record, [
        "id",
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
    }
  }
}

export default ReferenceSerializer
