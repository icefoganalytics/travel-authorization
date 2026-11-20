import { Factory } from "fishery"

import {
  type TravelDeskInvoiceAsShow,
  type TravelDeskInvoiceItemAsShow,
  TravelDeskInvoiceItemProductTypes,
  TravelDeskInvoiceItemSaleTypes,
} from "@/api/travel-desk-invoices-api"

export const travelDeskInvoiceFactory = Factory.define<TravelDeskInvoiceAsShow>(({ sequence }) => ({
  id: sequence,
  travelDeskTravelRequestId: sequence,
  bookingReference: "ABC123",
  externalBookingEventIdentifier: sequence,
  currencyCode: "CAD",
  invoiceNumber: null,
  invoiceDate: null,
  warrantNumber: null,
  clientNumber: null,
  clientName: null,
  department: null,
  mailcode: null,
  iataNumber: null,
  bookingAgentName: null,
  ticketingAgentName: null,
  bookingDate: null,
  grossAmount: "0.000",
  items: [],
}))

export const travelDeskInvoiceItemFactory = Factory.define<TravelDeskInvoiceItemAsShow>(
  ({ sequence }) => ({
    id: sequence,
    productType: TravelDeskInvoiceItemProductTypes.AIR,
    travelDeskFlightSegmentId: null,
    sourceAirSegmentNumber: sequence,
    sourceServiceFeeEventExternalIdentifier: null,
    passengerName: null,
    ticketNumber: null,
    vendor: null,
    description: null,
    saleType: TravelDeskInvoiceItemSaleTypes.SALE,
    grossAmount: "0.000",
    position: 0,
  })
)

export default travelDeskInvoiceFactory
