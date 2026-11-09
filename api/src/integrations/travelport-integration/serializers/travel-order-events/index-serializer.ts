import { isNil } from "lodash"

import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
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
      creatingAgencyInternationalAirTransportAssociationNumber: trimSourceValue(this.record.creatingAgencyIata),
      passengers: (this.record.passengers ?? []).map((passenger) => ({
        lastNameElement: passenger.lastNameElement,
        passengerElement: passenger.passengerElement,
        firstName: trimSourceValue(passenger.firstName),
        lastName: trimSourceValue(passenger.lastName),
      })),
      airReservationSegments: (this.record.airReservationSegments ?? []).map((segment) => ({
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
      })),
      serviceFeeTransaction: isNil(this.record.serviceFeeTransaction)
        ? null
        : {
            activeVoidStatus: trimSourceValue(this.record.serviceFeeTransaction.activeVoidStatus),
            serviceFeeDocumentNumber: trimSourceValue(
              this.record.serviceFeeTransaction.serviceFeeDocumentNumber
            ),
            issueDate: trimSourceValue(this.record.serviceFeeTransaction.issueDate),
            currencyCode: trimSourceValue(this.record.serviceFeeTransaction.currencyCode),
            serviceFeeAmount: this.record.serviceFeeTransaction.serviceFeeAmount,
            commissionAmount: this.record.serviceFeeTransaction.commissionAmount,
            nameOnServiceFee: trimSourceValue(this.record.serviceFeeTransaction.nameOnServiceFee),
            relatedTicketDocumentNumber: trimSourceValue(
              this.record.serviceFeeTransaction.relatedTicketDocumentNumber
            ),
            relatedInvoiceNumber: trimSourceValue(
              this.record.serviceFeeTransaction.relatedInvoiceNumber
            ),
          },
    }
  }
}

export default IndexSerializer
