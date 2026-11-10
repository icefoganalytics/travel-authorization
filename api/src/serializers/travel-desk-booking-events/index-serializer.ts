import type { BookingEventSnapshot } from "@/integrations/travelport-integration/models/booking-event-snapshot"
import { TravelDeskBookingEvent } from "@/models/travel-desk-booking-event"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskBookingEventAsIndex = BookingEventSnapshot

export class IndexSerializer extends BaseSerializer<TravelDeskBookingEvent> {
  perform(): TravelDeskBookingEventAsIndex {
    return {
      travelOrderIdentifier: this.record.externalTravelportIdentifier,
      bookingFileVersionNumber: this.record.bookingFileVersionNumber,
      eventType: this.record.eventType,
      recordLocator: this.record.recordLocator,
      reservationSystemDescription: this.record.reservationSystemDescription,
      databaseTimestamp: this.record.databaseTimestamp.toISOString(),
      hostEventTimestamp: this.record.hostEventTimestamp?.toISOString() ?? null,
      passengerNameRecordCreatedAt: this.record.passengerNameRecordCreatedAt?.toISOString() ?? null,
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
