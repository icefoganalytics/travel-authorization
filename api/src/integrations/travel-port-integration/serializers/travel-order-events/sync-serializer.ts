import { isNil } from "lodash"

import {
  AirReservationSegment,
  Passenger,
  ServiceFeeTransaction,
  TravelOrderEvent,
} from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

function trimSourceValue(value: string | null): string | null {
  if (isNil(value)) return null

  return value.trim()
}

export class SyncSerializer extends BaseSerializer<TravelOrderEvent> {
  perform() {
    const eventType = trimSourceValue(this.record.eventType)
    const recordLocator = trimSourceValue(this.record.recordLocator)
    const reservationSystemDescription = trimSourceValue(this.record.crsDescription)
    const owningAgencyName = trimSourceValue(this.record.owningAgencyName)
    const transactionAgencyName = trimSourceValue(this.record.transactionAgencyName)
    const transactionAgent = trimSourceValue(this.record.transactionAgent)
    const creatingAgencyInternationalAirTransportAssociationNumber = trimSourceValue(
      this.record.creatingAgencyIata
    )
    const passengers = this.serializePassengers(this.record.passengers)
    const airReservationSegments = this.serializeAirReservationSegments(
      this.record.airReservationSegments
    )
    const serviceFeeTransaction = this.serializeServiceFeeTransaction(this.record.serviceFeeTransaction)

    return {
      travelOrderIdentifier: this.record.travelOrderIdentifier,
      bookingFileVersionNumber: this.record.bookingFileVersionNumber,
      eventType,
      recordLocator,
      reservationSystemDescription,
      databaseTimestamp: this.record.databaseTimestamp,
      hostEventTimestamp: this.record.hostEventTimestamp,
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

  private serializePassengers(passengers: Passenger[] | undefined) {
    if (isNil(passengers)) return []

    return passengers.map((passenger) => {
      const firstName = trimSourceValue(passenger.firstName)
      const lastName = trimSourceValue(passenger.lastName)

      return {
        lastNameElement: passenger.lastNameElement,
        passengerElement: passenger.passengerElement,
        firstName,
        lastName,
      }
    })
  }

  private serializeAirReservationSegments(airReservationSegments: AirReservationSegment[] | undefined) {
    if (isNil(airReservationSegments)) return []

    return airReservationSegments.map((segment) => {
      const segmentStatus = trimSourceValue(segment.segmentStatus)
      const carrierCode = trimSourceValue(segment.carrierCode)
      const boardPoint = trimSourceValue(segment.boardPoint)
      const offPoint = trimSourceValue(segment.offPoint)
      const flightNumber = trimSourceValue(segment.flightNumber)
      const departureDate = trimSourceValue(segment.departureDate)
      const departureTime = trimSourceValue(segment.departureTime)
      const arrivalTime = trimSourceValue(segment.arrivalTime)

      return {
        airSegmentNumber: segment.airSegmentNumber,
        segmentStatus,
        carrierCode,
        boardPoint,
        offPoint,
        flightNumber,
        departureDate,
        departureTime,
        arrivalTime,
        changeOfDay: segment.changeOfDay,
      }
    })
  }

  private serializeServiceFeeTransaction(
    serviceFeeTransaction: ServiceFeeTransaction | null | undefined
  ) {
    if (isNil(serviceFeeTransaction)) return null

    const activeVoidStatus = trimSourceValue(serviceFeeTransaction.activeVoidStatus)
    const serviceFeeDocumentNumber = trimSourceValue(serviceFeeTransaction.serviceFeeDocumentNumber)
    const issueDate = trimSourceValue(serviceFeeTransaction.issueDate)
    const currencyCode = trimSourceValue(serviceFeeTransaction.currencyCode)
    const nameOnServiceFee = trimSourceValue(serviceFeeTransaction.nameOnServiceFee)
    const relatedTicketDocumentNumber = trimSourceValue(
      serviceFeeTransaction.relatedTicketDocumentNumber
    )
    const relatedInvoiceNumber = trimSourceValue(serviceFeeTransaction.relatedInvoiceNumber)

    return {
      activeVoidStatus,
      serviceFeeDocumentNumber,
      issueDate,
      currencyCode,
      serviceFeeAmount: serviceFeeTransaction.serviceFeeAmount,
      commissionAmount: serviceFeeTransaction.commissionAmount,
      nameOnServiceFee,
      relatedTicketDocumentNumber,
      relatedInvoiceNumber,
    }
  }
}

export default SyncSerializer
