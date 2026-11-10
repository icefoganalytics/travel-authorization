export type BookingPassenger = {
  lastNameElement: number
  passengerElement: number
  firstName: string | null
  lastName: string | null
}

export type BookingSegment = {
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

export type BookingServiceFee = {
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

export type BookingEventSnapshot = {
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
  passengers: BookingPassenger[]
  airReservationSegments: BookingSegment[]
  serviceFeeTransaction: BookingServiceFee | null
}
