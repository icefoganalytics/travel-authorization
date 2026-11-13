import { pick } from "lodash"
import { DateTime } from "luxon"

import type { BookingEventSnapshot } from "@/integrations/travel-port-integration/models/booking-event-snapshot"
import { TravelDeskBookingEvent } from "@/models/travel-desk-booking-event"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskBookingEventAsIndex = BookingEventSnapshot

export class IndexSerializer extends BaseSerializer<TravelDeskBookingEvent> {
  perform(): TravelDeskBookingEventAsIndex {
    const databaseTimestamp = this.formatTimestamp(this.record.databaseTimestamp)
    const hostEventTimestamp = this.formatTimestamp(this.record.hostEventTimestamp)
    const passengerNameRecordCreatedAt = this.formatTimestamp(this.record.passengerNameRecordCreatedAt)

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

  private formatTimestamp(value: Date): string
  private formatTimestamp(value: Date | null): string | null
  private formatTimestamp(value: Date | null): string | null {
    if (value === null) return null

    const timestamp = DateTime.fromJSDate(value, { zone: "utc" }).toISO()
    if (timestamp === null) {
      throw new Error("Cannot serialize an invalid booking event timestamp.")
    }

    return timestamp
  }
}

export default IndexSerializer
