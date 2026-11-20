import { isUndefined, pick } from "lodash"

import { type TravelDeskInvoice } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelDeskInvoiceItems } from "@/serializers"

export type TravelDeskInvoiceAsShow = {
  id: number
  travelDeskTravelRequestId: number
  bookingReference: string
  externalBookingEventIdentifier: number
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
    const { items: travelDeskInvoiceItems } = this.record
    if (isUndefined(travelDeskInvoiceItems)) {
      throw new Error("Expected invoice items to be preloaded.")
    }

    const serializedTravelDeskInvoiceItems = TravelDeskInvoiceItems.ReferenceSerializer.perform(travelDeskInvoiceItems)

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

export default ShowSerializer
