import { isNil, pick } from "lodash"
import { DateTime } from "luxon"

import { TravelDeskBookingEvent } from "@/models/travel-desk-booking-event"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskBookingEventAsIndex = Pick<
  TravelDeskBookingEvent,
  | "bookingFileVersionNumber"
  | "eventType"
  | "bookingReference"
  | "reservationSystemDescription"
  | "owningAgencyName"
  | "transactionAgencyName"
  | "transactionAgent"
  | "creatingAgencyInternationalAirTransportAssociationNumber"
  | "passengers"
  | "airReservationSegments"
  | "serviceFeeTransaction"
> & {
  travelOrderIdentifier: number
  externalCreatedAt: string | null
  hostEventTimestamp: string | null
  passengerNameRecordCreatedAt: string | null
}

export class IndexSerializer extends BaseSerializer<TravelDeskBookingEvent> {
  perform(): TravelDeskBookingEventAsIndex {
    const externalCreatedAt = this.formatTimestamp(this.record.externalCreatedAt)
    const hostEventTimestamp = this.formatTimestamp(this.record.hostEventTimestamp)
    const passengerNameRecordCreatedAt = this.formatTimestamp(this.record.passengerNameRecordCreatedAt)

    return {
      travelOrderIdentifier: this.record.externalTravelPortIdentifier,
      ...pick(this.record, [
        "bookingFileVersionNumber",
        "eventType",
        "bookingReference",
        "reservationSystemDescription",
        "owningAgencyName",
        "transactionAgencyName",
        "transactionAgent",
        "creatingAgencyInternationalAirTransportAssociationNumber",
        "passengers",
        "airReservationSegments",
        "serviceFeeTransaction",
      ]),
      externalCreatedAt,
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
