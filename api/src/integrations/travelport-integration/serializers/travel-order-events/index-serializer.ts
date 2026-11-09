import { isNil } from "lodash"

import {
  AirReservationSegment,
  Passenger,
  ServiceFeeTransaction,
  TravelOrderEvent,
} from "@/integrations/travelport-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

function trimSourceValue(value: string | null): string | null {
  if (isNil(value)) return null

  return value.trim()
}

export class IndexSerializer extends BaseSerializer<TravelOrderEvent> {
  perform() {
    return {
      travelOrderIdentifier: this.record.travelOrderIdentifier,
      bookingFileVersionNumber: this.record.bookingFileVersionNumber,
      eventType: trimSourceValue(this.record.eventType),
      recordLocator: trimSourceValue(this.record.recordLocator),
      reservationSystemDescription: trimSourceValue(this.record.crsDescription),
      databaseTimestamp: this.record.databaseTimestamp,
      hostEventTimestamp: this.record.hostEventTimestamp,
      passengerNameRecordCreatedAt: this.record.pnrCreationDate,
      owningAgencyName: trimSourceValue(this.record.owningAgencyName),
      transactionAgencyName: trimSourceValue(this.record.transactionAgencyName),
      transactionAgent: trimSourceValue(this.record.transactionAgent),
      creatingAgencyInternationalAirTransportAssociationNumber: trimSourceValue(
        this.record.creatingAgencyIata
      ),
      passengers: this.serializePassengers(this.record.passengers),
      airReservationSegments: this.serializeAirReservationSegments(this.record.airReservationSegments),
      serviceFeeTransaction: this.serializeServiceFeeTransaction(this.record.serviceFeeTransaction),
    }
  }

  private serializePassengers(passengers: Passenger[] | undefined) {
    return (passengers ?? []).map((passenger) => ({
      lastNameElement: passenger.lastNameElement,
      passengerElement: passenger.passengerElement,
      firstName: trimSourceValue(passenger.firstName),
      lastName: trimSourceValue(passenger.lastName),
    }))
  }

  private serializeAirReservationSegments(airReservationSegments: AirReservationSegment[] | undefined) {
    return (airReservationSegments ?? []).map((segment) => ({
      airSegmentNumber: segment.airSegmentNumber,
      segmentStatus: trimSourceValue(segment.segmentStatus),
      carrierCode: trimSourceValue(segment.carrierCode),
      boardPoint: trimSourceValue(segment.boardPoint),
      offPoint: trimSourceValue(segment.offPoint),
      flightNumber: trimSourceValue(segment.flightNumber),
      departureDate: trimSourceValue(segment.departureDate),
      departureTime: trimSourceValue(segment.departureTime),
      arrivalTime: trimSourceValue(segment.arrivalTime),
      changeOfDay: segment.changeOfDay,
    }))
  }

  private serializeServiceFeeTransaction(
    serviceFeeTransaction: ServiceFeeTransaction | null | undefined
  ) {
    if (isNil(serviceFeeTransaction)) return null

    return {
      activeVoidStatus: trimSourceValue(serviceFeeTransaction.activeVoidStatus),
      serviceFeeDocumentNumber: trimSourceValue(serviceFeeTransaction.serviceFeeDocumentNumber),
      issueDate: trimSourceValue(serviceFeeTransaction.issueDate),
      currencyCode: trimSourceValue(serviceFeeTransaction.currencyCode),
      serviceFeeAmount: serviceFeeTransaction.serviceFeeAmount,
      commissionAmount: serviceFeeTransaction.commissionAmount,
      nameOnServiceFee: trimSourceValue(serviceFeeTransaction.nameOnServiceFee),
      relatedTicketDocumentNumber: trimSourceValue(serviceFeeTransaction.relatedTicketDocumentNumber),
      relatedInvoiceNumber: trimSourceValue(serviceFeeTransaction.relatedInvoiceNumber),
    }
  }
}

export default IndexSerializer
