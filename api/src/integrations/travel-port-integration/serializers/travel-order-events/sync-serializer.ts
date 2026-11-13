import { isNil, isUndefined, pick } from "lodash"

import {
  AirReservationSegment,
  Passenger,
  ServiceFeeTransaction,
  TravelOrderEvent,
} from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

import {
  AirReservationSegments,
  Passengers,
  ServiceFeeTransactions,
} from "@/integrations/travel-port-integration/serializers"

export class SyncSerializer extends BaseSerializer<TravelOrderEvent> {
  perform() {
    const { passengers, airReservationSegments, serviceFeeTransaction } = this.record

    if (isUndefined(passengers)) {
      throw new Error("Expected passengers to be preloaded.")
    }

    if (isUndefined(airReservationSegments)) {
      throw new Error("Expected airReservationSegments to be preloaded.")
    }

    if (isUndefined(serviceFeeTransaction)) {
      throw new Error("Expected serviceFeeTransaction to be preloaded.")
    }

    const eventType = this.trimSourceValue(this.record.eventType)
    const recordLocator = this.trimSourceValue(this.record.recordLocator)
    const reservationSystemDescription = this.trimSourceValue(this.record.crsDescription)
    const owningAgencyName = this.trimSourceValue(this.record.owningAgencyName)
    const transactionAgencyName = this.trimSourceValue(this.record.transactionAgencyName)
    const transactionAgent = this.trimSourceValue(this.record.transactionAgent)
    const creatingAgencyInternationalAirTransportAssociationNumber = this.trimSourceValue(
      this.record.creatingAgencyIata
    )
    const serializedPassengers = this.serializePassengers(passengers)
    const serializedAirReservationSegments = this.serializeAirReservationSegments(airReservationSegments)
    const serializedServiceFeeTransaction = this.serializeServiceFeeTransaction(serviceFeeTransaction)

    return {
      ...pick(this.record, [
        "travelOrderIdentifier",
        "bookingFileVersionNumber",
        "databaseTimestamp",
        "hostEventTimestamp",
      ]),
      eventType,
      recordLocator,
      reservationSystemDescription,
      passengerNameRecordCreatedAt: this.record.pnrCreationDate,
      owningAgencyName,
      transactionAgencyName,
      transactionAgent,
      creatingAgencyInternationalAirTransportAssociationNumber,
      passengers: serializedPassengers,
      airReservationSegments: serializedAirReservationSegments,
      serviceFeeTransaction: serializedServiceFeeTransaction,
    }
  }

  private trimSourceValue(value: string | null): string | null {
    if (isNil(value)) return null

    return value.trim()
  }

  private serializePassengers(passengers: Passenger[]) {
    return Passengers.SyncSerializer.perform(passengers)
  }

  private serializeAirReservationSegments(airReservationSegments: AirReservationSegment[]) {
    return AirReservationSegments.SyncSerializer.perform(airReservationSegments)
  }

  private serializeServiceFeeTransaction(
    serviceFeeTransaction: ServiceFeeTransaction | null
  ) {
    if (isNil(serviceFeeTransaction)) return null

    return ServiceFeeTransactions.SyncSerializer.perform(serviceFeeTransaction)
  }
}

export default SyncSerializer
