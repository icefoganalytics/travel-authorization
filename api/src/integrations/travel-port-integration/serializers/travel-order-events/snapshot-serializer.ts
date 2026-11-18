import { isNull, isUndefined } from "lodash"

import {
  ServiceFeeTransaction,
  TravelOrderEvent,
} from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

import {
  AirReservationSegments,
  Passengers,
  ServiceFeeTransactions,
} from "@/integrations/travel-port-integration/serializers"

export class SnapshotSerializer extends BaseSerializer<TravelOrderEvent> {
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

    const hostEventTimestamp = this.formatSqlDateTime(this.record.hostEventTimestamp)
    const databaseTimestamp = this.formatSqlDateTime(this.record.databaseTimestamp)
    const pnrCreationDate = this.formatSqlDateTime(this.record.pnrCreationDate)
    const pnrPurgeDate = this.formatSqlDateTime(this.record.pnrPurgeDate)
    const serializedPassengers = Passengers.SnapshotSerializer.perform(passengers)
    const serializedAirReservationSegments =
      AirReservationSegments.SnapshotSerializer.perform(airReservationSegments)
    const serializedServiceFeeTransaction = this.serializeServiceFeeTransaction(serviceFeeTransaction)

    return {
      travelOrderEvent: {
        TravelOrderIdentifier: this.record.travelOrderIdentifier,
        PnrBfVersionNbr: this.record.bookingFileVersionNumber,
        EventType: this.record.eventType,
        RecordLocator: this.record.recordLocator,
        HostEventTimeStamp: hostEventTimestamp,
        CrsDescription: this.record.crsDescription,
        DatabaseTimeStamp: databaseTimestamp,
        TransactionPseudo: this.record.transactionPseudo,
        TransactionAgent: this.record.transactionAgent,
        OwningAgencyPseudo: this.record.owningAgencyPseudo,
        OriginalBookingLocation: this.record.originalBookingLocation,
        CreatingAgencyIata: this.record.creatingAgencyIata,
        PnrCreationDate: pnrCreationDate,
        PnrPurgeDate: pnrPurgeDate,
        OwningAgencyName: this.record.owningAgencyName,
        TransactionAgencyName: this.record.transactionAgencyName,
        LastActionAgentID: this.record.lastActionAgentId,
      },
      passengers: serializedPassengers,
      airReservationSegments: serializedAirReservationSegments,
      serviceFeeTransaction: serializedServiceFeeTransaction,
    }
  }

  private formatSqlDateTime(value: Date): string
  private formatSqlDateTime(value: Date | null): string | null
  private formatSqlDateTime(value: Date | null): string | null {
    if (isNull(value)) return null

    // SQL Server style 126 omits the timezone suffix and a zero millisecond fraction.
    return value.toISOString().replace(/(?:\.000)?Z$/, "")
  }

  private serializeServiceFeeTransaction(serviceFeeTransaction: ServiceFeeTransaction | null) {
    if (isNull(serviceFeeTransaction)) return null

    return ServiceFeeTransactions.SnapshotSerializer.perform(serviceFeeTransaction)
  }
}

export type RawBookingEventSnapshot = ReturnType<SnapshotSerializer["perform"]>

export default SnapshotSerializer
