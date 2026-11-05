import http from "@/api/http-client"
import type { QueryOptions } from "@/api/base-api"

export type InvoiceBookingPassenger = {
  lastNameElement: number
  passengerElement: number
  firstName: string | null
  lastName: string | null
}

export type InvoiceBookingSegment = {
  airSegmentNumber: number
  segmentStatus: string | null
  carrierCode: string | null
  boardPoint: string | null
  offPoint: string | null
  flightNumber: string | null
  departureDate: string | null
  departureTime: string | null
  arrivalTime: string | null
  changeOfDay: number | null
}

export type InvoiceBookingServiceFee = {
  activeVoidStatus: string | null
  serviceFeeDocumentNumber: string | null
  issueDate: string | null
  currencyCode: string | null
  serviceFeeAmount: string | null
  commissionAmount: string | null
  nameOnServiceFee: string | null
  relatedTicketDocumentNumber: string | null
  relatedInvoiceNumber: string | null
}

export type InvoiceBookingEvent = {
  travelOrderIdentifier: number
  bookingFileVersionNumber: number | null
  eventType: string | null
  recordLocator: string | null
  crsDescription: string | null
  databaseTimestamp: string
  hostEventTimestamp: string | null
  pnrCreationDate: string | null
  owningAgencyName: string | null
  transactionAgencyName: string | null
  transactionAgent: string | null
  creatingAgencyIata: string | null
  passengers: InvoiceBookingPassenger[]
  airReservationSegments: InvoiceBookingSegment[]
  serviceFeeTransaction: InvoiceBookingServiceFee | null
}

export type InvoiceSourceSnapshot = {
  bookingEvent: InvoiceBookingEvent
  serviceFeeEvents: InvoiceBookingEvent[]
}

export type InvoiceLocalFlightSegment = {
  id: number
  flightNumber: string | null
  departLocation: string | null
  arriveLocation: string | null
  departAt: string | null
  arriveAt: string | null
}

export type TravelDeskInvoiceProductType = {
  id: number
  code: string
  name: string
  description: string | null
}

export type TravelDeskInvoiceItem = {
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
  productType: TravelDeskInvoiceProductType
}

export type TravelDeskInvoice = {
  id: number
  travelDeskTravelRequestId: number
  recordLocator: string
  sourceBookingEventId: number
  sourceSnapshot: InvoiceSourceSnapshot
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
  items: TravelDeskInvoiceItem[]
}

export type InvoiceItemInput = {
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
}

export type InvoiceInput = {
  travelDeskTravelRequestId: number
  recordLocator: string
  sourceBookingEventId: number
  sourceServiceFeeEventIds: number[]
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
  items: InvoiceItemInput[]
}

export type InvoiceUpdateInput = Pick<
  InvoiceInput,
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
  | "items"
>
export type InvoiceBookingSearchResult = {
  bookingEvents: InvoiceBookingEvent[]
  flightSegments: InvoiceLocalFlightSegment[]
}

type InvoiceResponse = { travelDeskInvoice: TravelDeskInvoice }
type InvoicesResponse = { travelDeskInvoices: TravelDeskInvoice[]; totalCount: number }

export type TravelDeskInvoicesQueryOptions = QueryOptions<
  { travelDeskTravelRequestId?: number },
  Record<string, never>
>

export const travelDeskInvoicesApi = {
  list(params: TravelDeskInvoicesQueryOptions) {
    return http
      .get<InvoicesResponse>("/api/travel-desk-invoices", { params })
      .then(({ data }) => data)
  },
  get(id: number) {
    return http.get<InvoiceResponse>(`/api/travel-desk-invoices/${id}`).then(({ data }) => data)
  },
  create(attributes: InvoiceInput) {
    return http
      .post<InvoiceResponse>("/api/travel-desk-invoices", attributes)
      .then(({ data }) => data)
  },
  update(id: number, attributes: InvoiceUpdateInput) {
    return http
      .patch<InvoiceResponse>(`/api/travel-desk-invoices/${id}`, attributes)
      .then(({ data }) => data)
  },
  delete(id: number) {
    return http.delete(`/api/travel-desk-invoices/${id}`).then(({ data }) => data)
  },
  bookingEvents(requestId: number, recordLocator?: string) {
    return http
      .get<InvoiceBookingSearchResult>(
        `/api/travel-desk-travel-requests/${requestId}/invoice-bookings`,
        {
          params: { recordLocator },
        }
      )
      .then(({ data }) => data)
  },
}

export default travelDeskInvoicesApi
