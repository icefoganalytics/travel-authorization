import http from "@/api/http-client"

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

export type TravelDeskBookingEventAsIndex = {
  travelOrderIdentifier: number
  bookingFileVersionNumber: number | null
  eventType: string | null
  recordLocator: string | null
  reservationSystemDescription: string | null
  databaseTimestamp: string
  hostEventTimestamp: string | null
  passengerNameRecordCreatedAt: string | null
  owningAgencyName: string | null
  transactionAgencyName: string | null
  transactionAgent: string | null
  creatingAgencyInternationalAirTransportAssociationNumber: string | null
  passengers: InvoiceBookingPassenger[]
  airReservationSegments: InvoiceBookingSegment[]
  serviceFeeTransaction: InvoiceBookingServiceFee | null
}

export const travelDeskBookingEventsApi = {
  async list(
    travelDeskTravelRequestId: number,
    params: { recordLocator: string }
  ): Promise<{ travelDeskBookingEvents: TravelDeskBookingEventAsIndex[] }> {
    const { data } = await http.get<{ travelDeskBookingEvents: TravelDeskBookingEventAsIndex[] }>(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/travel-desk-booking-events`,
      { params }
    )
    return data
  },
}

export default travelDeskBookingEventsApi
