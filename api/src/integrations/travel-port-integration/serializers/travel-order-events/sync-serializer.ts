import { isNil, isUndefined, pick } from "lodash"

import {
  AirReservationSegment,
  Passenger,
  ServiceFeeTransaction,
  TravelOrderEvent,
} from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<TravelOrderEvent> {
  perform() {
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

  private serializePassengers(passengers: Passenger[] | undefined) {
    if (isUndefined(passengers)) {
      throw new Error("Expected passengers to be preloaded.")
    }

    return passengers.map((passenger) => {
      const firstName = this.trimSourceValue(passenger.firstName)
      const lastName = this.trimSourceValue(passenger.lastName)

      return {
        ...pick(passenger, ["lastNameElement", "passengerElement"]),
        firstName,
        lastName,
      }
    })
  }

  private serializeAirReservationSegments(airReservationSegments: AirReservationSegment[] | undefined) {
    if (isUndefined(airReservationSegments)) {
      throw new Error("Expected airReservationSegments to be preloaded.")
    }

    return airReservationSegments.map((segment) => {
      const segmentStatus = this.trimSourceValue(segment.segmentStatus)
      const carrierCode = this.trimSourceValue(segment.carrierCode)
      const boardPoint = this.trimSourceValue(segment.boardPoint)
      const offPoint = this.trimSourceValue(segment.offPoint)
      const flightNumber = this.trimSourceValue(segment.flightNumber)
      const departureDate = this.trimSourceValue(segment.departureDate)
      const departureTime = this.trimSourceValue(segment.departureTime)
      const arrivalTime = this.trimSourceValue(segment.arrivalTime)

      return {
        ...pick(segment, ["airSegmentNumber", "changeOfDay"]),
        segmentStatus,
        carrierCode,
        boardPoint,
        offPoint,
        flightNumber,
        departureDate,
        departureTime,
        arrivalTime,
      }
    })
  }

  private serializeServiceFeeTransaction(
    serviceFeeTransaction: ServiceFeeTransaction | null | undefined
  ) {
    if (isUndefined(serviceFeeTransaction)) {
      throw new Error("Expected serviceFeeTransaction to be preloaded.")
    }

    if (isNil(serviceFeeTransaction)) return null

    const activeVoidStatus = this.trimSourceValue(serviceFeeTransaction.activeVoidStatus)
    const serviceFeeDocumentNumber = this.trimSourceValue(serviceFeeTransaction.serviceFeeDocumentNumber)
    const issueDate = this.trimSourceValue(serviceFeeTransaction.issueDate)
    const currencyCode = this.trimSourceValue(serviceFeeTransaction.currencyCode)
    const nameOnServiceFee = this.trimSourceValue(serviceFeeTransaction.nameOnServiceFee)
    const relatedTicketDocumentNumber = this.trimSourceValue(
      serviceFeeTransaction.relatedTicketDocumentNumber
    )
    const relatedInvoiceNumber = this.trimSourceValue(serviceFeeTransaction.relatedInvoiceNumber)

    return {
      ...pick(serviceFeeTransaction, ["serviceFeeAmount", "commissionAmount"]),
      activeVoidStatus,
      serviceFeeDocumentNumber,
      issueDate,
      currencyCode,
      nameOnServiceFee,
      relatedTicketDocumentNumber,
      relatedInvoiceNumber,
    }
  }
}

export default SyncSerializer
