import { pick } from "lodash"

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
      ...pick(this.record, [
        "bookingFileVersionNumber",
        "eventType",
        "recordLocator",
        "reservationSystemDescription",
        "owningAgencyName",
        "transactionAgencyName",
        "transactionAgent",
        "creatingAgencyInternationalAirTransportAssociationNumber",
        "passengers",
        "airReservationSegments",
        "serviceFeeTransaction",
      ]),
      databaseTimestamp,
      hostEventTimestamp,
      passengerNameRecordCreatedAt,
    }
  }
}

export default IndexSerializer
