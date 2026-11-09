import {
  type BookingEventSnapshot,
  TravelDeskBookingEvent,
} from "@/models/travel-desk-booking-event"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskBookingEventAsIndex = BookingEventSnapshot

export class IndexSerializer extends BaseSerializer<TravelDeskBookingEvent> {
  perform(): TravelDeskBookingEventAsIndex {
    return {
      travelOrderIdentifier: this.record.externalTravelportIdentifier,
      bookingFileVersionNumber: this.record.bookingFileVersionNumber,
      eventType: this.record.eventType,
      recordLocator: this.record.recordLocator,
      crsDescription: this.record.crsDescription,
      databaseTimestamp: this.record.databaseTimestamp.toISOString(),
      hostEventTimestamp: this.record.hostEventTimestamp?.toISOString() ?? null,
      pnrCreationDate: this.record.pnrCreationDate?.toISOString() ?? null,
      owningAgencyName: this.record.owningAgencyName,
      transactionAgencyName: this.record.transactionAgencyName,
      transactionAgent: this.record.transactionAgent,
      creatingAgencyIata: this.record.creatingAgencyIata,
      passengers: this.record.passengers,
      airReservationSegments: this.record.airReservationSegments,
      serviceFeeTransaction: this.record.serviceFeeTransaction,
    }
  }
}

export default IndexSerializer
