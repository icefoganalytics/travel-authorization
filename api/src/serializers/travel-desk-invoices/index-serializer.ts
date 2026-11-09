import { pick } from "lodash"

import { type TravelDeskInvoice } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { ReferenceSerializer, type AsReference } from "@/serializers/travel-desk-invoice-items"

export type TravelDeskInvoiceAsIndex = Pick<
  TravelDeskInvoice,
  | "id"
  | "travelDeskTravelRequestId"
  | "recordLocator"
  | "sourceBookingEventId"
  | "sourceSnapshot"
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
    const { items } = this.record
    if (!items) {
      throw new Error("Expected invoice items to be preloaded.")
    }

    const serializedItems = ReferenceSerializer.perform(items)
    serializedItems.sort((item1, item2) => item1.position - item2.position)

    return {
      ...pick(this.record, [
        "id",
        "travelDeskTravelRequestId",
        "recordLocator",
        "sourceBookingEventId",
        "sourceSnapshot",
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
      items: serializedItems,
    }
  }
}

export default IndexSerializer
