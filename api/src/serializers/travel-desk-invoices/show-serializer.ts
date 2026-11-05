import { type TravelDeskInvoice, type TravelDeskInvoiceItem } from "@/models"

export type TravelDeskInvoiceItemAsShow = {
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
  items: TravelDeskInvoiceItemAsShow[]
}

function serializeItem(item: TravelDeskInvoiceItem): TravelDeskInvoiceItemAsShow {
  const { productType } = item

  if (!productType) throw new Error("Expected invoice item product type to be preloaded.")

  return {
    id: item.id,
    travelDeskProductTypeId: item.travelDeskProductTypeId,
    travelDeskFlightSegmentId: item.travelDeskFlightSegmentId,
    sourceAirSegmentNumber: item.sourceAirSegmentNumber,
    sourceServiceFeeEventId: item.sourceServiceFeeEventId,
    passengerName: item.passengerName,
    ticketNumber: item.ticketNumber,
    vendor: item.vendor,
    description: item.description,
    saleType: item.saleType,
    grossAmount: item.grossAmount,
    position: item.position,
    productType: {
      id: productType.id,
      code: productType.code,
      name: productType.name,
      description: productType.description,
    },
  }
}

export class ShowSerializer {
  static perform(invoice: TravelDeskInvoice): TravelDeskInvoiceAsShow {
    const { items } = invoice

    if (!items) throw new Error("Expected invoice items to be preloaded.")

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
      items: items.map(serializeItem).sort((item1, item2) => item1.position - item2.position),
    }
  }
}

export default ShowSerializer
