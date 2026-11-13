import { isNil, pick } from "lodash"
import { DateTime } from "luxon"

import type { BookingEventSnapshot } from "@/integrations/travel-port-integration/models/booking-event-snapshot"
import { TravelDeskBookingEvent } from "@/models/travel-desk-booking-event"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskBookingEventAsIndex = Omit<BookingEventSnapshot, "databaseTimestamp"> & {
  databaseTimestamp: string | null
}

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

  private formatTimestamp(value: Date | null | undefined): string | null {
    if (isNil(value)) return null

    return DateTime.fromJSDate(value, { zone: "utc" }).toISO()
  }
}

export default IndexSerializer
