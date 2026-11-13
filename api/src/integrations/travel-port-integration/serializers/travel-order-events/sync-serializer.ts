import { isNil, isUndefined, pick } from "lodash"

import {
  AirReservationSegment,
  Passenger,
  ServiceFeeTransaction,
  TravelOrderEvent,
} from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

import { SyncSerializer as AirReservationSegmentSyncSerializer } from "@/integrations/travel-port-integration/serializers/air-reservation-segments"
import { SyncSerializer as PassengerSyncSerializer } from "@/integrations/travel-port-integration/serializers/passengers"
import { SyncSerializer as ServiceFeeTransactionSyncSerializer } from "@/integrations/travel-port-integration/serializers/service-fee-transactions"

export class SyncSerializer extends BaseSerializer<TravelOrderEvent> {
  perform() {
    if (isUndefined(this.record.passengers)) {
      throw new Error("Expected passengers to be preloaded.")
    }

    if (isUndefined(this.record.airReservationSegments)) {
      throw new Error("Expected airReservationSegments to be preloaded.")
    }

    if (isUndefined(this.record.serviceFeeTransaction)) {
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
    const passengers = this.serializePassengers(this.record.passengers)
    const airReservationSegments = this.serializeAirReservationSegments(
      this.record.airReservationSegments
    )
    const serviceFeeTransaction = this.serializeServiceFeeTransaction(this.record.serviceFeeTransaction)

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
      passengers,
      airReservationSegments,
      serviceFeeTransaction,
    }
  }

  private trimSourceValue(value: string | null): string | null {
    if (isNil(value)) return null

    return value.trim()
  }

  private serializePassengers(passengers: Passenger[]) {
    return PassengerSyncSerializer.perform(passengers)
  }

  private serializeAirReservationSegments(airReservationSegments: AirReservationSegment[]) {
    return AirReservationSegmentSyncSerializer.perform(airReservationSegments)
  }

  private serializeServiceFeeTransaction(
    serviceFeeTransaction: ServiceFeeTransaction | null
  ) {
    if (isNil(serviceFeeTransaction)) return null

    return ServiceFeeTransactionSyncSerializer.perform(serviceFeeTransaction)
  }
}

export default SyncSerializer
