import type { BookingPassenger } from "@/integrations/travel-port-integration/models/booking-passenger"
import type { BookingSegment } from "@/integrations/travel-port-integration/models/booking-segment"
import type { BookingServiceFee } from "@/integrations/travel-port-integration/models/booking-service-fee"

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
