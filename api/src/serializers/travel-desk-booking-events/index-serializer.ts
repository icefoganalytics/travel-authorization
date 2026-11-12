import type { BookingEventSnapshot } from "@/integrations/travel-port-integration/models/booking-event-snapshot"
import { TravelDeskBookingEvent } from "@/models/travel-desk-booking-event"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskBookingEventAsIndex = BookingEventSnapshot

export class IndexSerializer extends BaseSerializer<TravelDeskBookingEvent> {
  perform(): TravelDeskBookingEventAsIndex {
    const databaseTimestamp = this.record.databaseTimestamp.toISOString()
    const hostEventTimestamp = this.record.hostEventTimestamp?.toISOString() ?? null
    const passengerNameRecordCreatedAt = this.record.passengerNameRecordCreatedAt?.toISOString() ?? null

    return {
      travelOrderIdentifier: this.record.externalTravelPortIdentifier,
      bookingFileVersionNumber: this.record.bookingFileVersionNumber,
      eventType: this.record.eventType,
      recordLocator: this.record.recordLocator,
      reservationSystemDescription: this.record.reservationSystemDescription,
      databaseTimestamp,
      hostEventTimestamp,
      passengerNameRecordCreatedAt,
      owningAgencyName: this.record.owningAgencyName,
      transactionAgencyName: this.record.transactionAgencyName,
      transactionAgent: this.record.transactionAgent,
      creatingAgencyInternationalAirTransportAssociationNumber: this.record.creatingAgencyInternationalAirTransportAssociationNumber,
      passengers: this.record.passengers,
      airReservationSegments: this.record.airReservationSegments,
      serviceFeeTransaction: this.record.serviceFeeTransaction,
    }
  }
}

export default IndexSerializer
