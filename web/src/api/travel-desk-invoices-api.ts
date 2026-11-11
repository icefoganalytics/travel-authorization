import type { QueryOptions } from "@/api/base-api"
import http from "@/api/http-client"
import type { TravelDeskProductType } from "@/api/travel-desk-product-types-api"
import type { TravelDeskBookingEventAsIndex } from "@/api/travel-desk-booking-events-api"

export type InvoiceSourceSnapshot = {
  bookingEvent: TravelDeskBookingEventAsIndex
  serviceFeeEvents: TravelDeskBookingEventAsIndex[]
}

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
  productType: TravelDeskProductType
}

export type TravelDeskInvoiceAsShow = {
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
  items: TravelDeskInvoiceItemAsShow[]
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

type InvoiceResponse = {
  travelDeskInvoice: TravelDeskInvoiceAsShow
}

type InvoicesResponse = {
  travelDeskInvoices: TravelDeskInvoiceAsShow[]
  totalCount: number
}

export type TravelDeskInvoicesQueryOptions = QueryOptions<
  { travelDeskTravelRequestId?: number },
  Record<string, never>
>

export const travelDeskInvoicesApi = {
  async list(
    travelDeskTravelRequestId: number,
    params: TravelDeskInvoicesQueryOptions = {}
  ): Promise<InvoicesResponse> {
    const { data } = await http.get<InvoicesResponse>(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-desk-invoices`,
      { params }
    )
    return data
  },
  async get(
    travelDeskTravelRequestId: number,
    travelDeskInvoiceId: number
  ): Promise<InvoiceResponse> {
    const { data } = await http.get<InvoiceResponse>(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-desk-invoices/${travelDeskInvoiceId}`
    )
    return data
  },
  async create(
    travelDeskTravelRequestId: number,
    attributes: InvoiceInput
  ): Promise<InvoiceResponse> {
    const { data } = await http.post<InvoiceResponse>(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-desk-invoices`,
      attributes
    )
    return data
  },
  async update(
    travelDeskTravelRequestId: number,
    travelDeskInvoiceId: number,
    attributes: InvoiceUpdateInput
  ): Promise<InvoiceResponse> {
    const { data } = await http.patch<InvoiceResponse>(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-desk-invoices/${travelDeskInvoiceId}`,
      attributes
    )
    return data
  },
  async delete(travelDeskTravelRequestId: number, travelDeskInvoiceId: number): Promise<void> {
    await http.delete(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-desk-invoices/${travelDeskInvoiceId}`
    )
  },
}

export default travelDeskInvoicesApi
