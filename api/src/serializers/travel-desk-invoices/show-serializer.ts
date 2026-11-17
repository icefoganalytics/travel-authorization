import { pick } from "lodash"

import { type TravelDeskInvoice } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelDeskInvoiceItems } from "@/serializers"

export type TravelDeskInvoiceAsShow = {
  id: number
  travelDeskTravelRequestId: number
  bookingReference: string
  externalBookingEventIdentifier: number
  sourceSnapshot: TravelDeskInvoice["sourceSnapshot"]
  currencyCode: string
  invoiceNumber: string | null
  invoiceDate: string | null
  warrantNumber: string | null
  clientNumber: string | null
  clientName: string | null
  department: string | null
  mailcode: string | null
  iataNumber: string | null
  bookingAgentName: string | null
  ticketingAgentName: string | null
  bookingDate: string | null
  grossAmount: string
  items: TravelDeskInvoiceItems.AsReference[]
}

export class ShowSerializer extends BaseSerializer<TravelDeskInvoice> {
  perform(): TravelDeskInvoiceAsShow {
    const invoice = this.record
    const { items } = invoice
    if (!items) {
      throw new Error("Expected invoice items to be preloaded.")
    }

    const serializedItems = TravelDeskInvoiceItems.ReferenceSerializer.perform(items)

    return {
      ...pick(invoice, [
        "id",
        "travelDeskTravelRequestId",
        "bookingReference",
        "externalBookingEventIdentifier",
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

export default ShowSerializer
