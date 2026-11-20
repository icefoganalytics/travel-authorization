import { isUndefined, pick } from "lodash"

import { type TravelDeskInvoice } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { ReferenceSerializer, type AsReference } from "@/serializers/travel-desk-invoice-items"

export type TravelDeskInvoiceAsIndex = Pick<
  TravelDeskInvoice,
  | "id"
  | "travelDeskTravelRequestId"
  | "bookingReference"
  | "externalBookingEventIdentifier"
  | "currencyCode"
  | "invoiceNumber"
  | "invoiceDate"
  | "warrantNumber"
  | "clientNumber"
  | "clientName"
  | "department"
  | "mailcode"
  | "iataNumber"
  | "bookingAgentName"
  | "ticketingAgentName"
  | "bookingDate"
  | "grossAmount"
> & {
  items: AsReference[]
}

export class IndexSerializer extends BaseSerializer<TravelDeskInvoice> {
  perform(): TravelDeskInvoiceAsIndex {
    const { items: travelDeskInvoiceItems } = this.record
    if (isUndefined(travelDeskInvoiceItems)) {
      throw new Error("Expected invoice items to be preloaded.")
    }

    const serializedTravelDeskInvoiceItems = ReferenceSerializer.perform(travelDeskInvoiceItems)

    return {
      ...pick(this.record, [
        "id",
        "travelDeskTravelRequestId",
        "bookingReference",
        "externalBookingEventIdentifier",
        "currencyCode",
        "invoiceNumber",
        "invoiceDate",
        "warrantNumber",
        "clientNumber",
        "clientName",
        "department",
        "mailcode",
        "iataNumber",
        "bookingAgentName",
        "ticketingAgentName",
        "bookingDate",
        "grossAmount",
      ]),
      items: serializedTravelDeskInvoiceItems,
    }
  }
}

export default IndexSerializer
