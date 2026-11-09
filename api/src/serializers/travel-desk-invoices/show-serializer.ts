import { type TravelDeskInvoice } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { ReferenceSerializer, type AsReference } from "@/serializers/travel-desk-invoice-items"

export type TravelDeskInvoiceAsShow = {
  id: number
  travelDeskTravelRequestId: number
  recordLocator: string
  sourceBookingEventId: number
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
  items: AsReference[]
}

export class ShowSerializer extends BaseSerializer<TravelDeskInvoice> {
  perform(): TravelDeskInvoiceAsShow {
    const invoice = this.record
    const { items } = invoice
    if (!items) {
      throw new Error("Expected invoice items to be preloaded.")
    }

    const serializedItems = ReferenceSerializer.perform(items)
    serializedItems.sort((item1, item2) => item1.position - item2.position)

    return {
      id: invoice.id,
      travelDeskTravelRequestId: invoice.travelDeskTravelRequestId,
      recordLocator: invoice.recordLocator,
      sourceBookingEventId: invoice.sourceBookingEventId,
      sourceSnapshot: invoice.sourceSnapshot,
      currencyCode: invoice.currencyCode,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      warrantNumber: invoice.warrantNumber,
      clientNumber: invoice.clientNumber,
      clientName: invoice.clientName,
      department: invoice.department,
      mailcode: invoice.mailcode,
      iataNumber: invoice.iataNumber,
      bookingAgentName: invoice.bookingAgentName,
      ticketingAgentName: invoice.ticketingAgentName,
      bookingDate: invoice.bookingDate,
      grossAmount: invoice.grossAmount,
      items: serializedItems,
    }
  }
}

export default ShowSerializer
