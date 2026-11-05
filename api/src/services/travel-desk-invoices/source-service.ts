import { isNil } from "lodash"

import { TRAVELPORT_DB_HOST, TRAVELPORT_DB_NAME, TRAVELPORT_DB_USER } from "@/config"
import { TravelOrderEvent } from "@/integrations/travelport-integration/models"
import { type InvoiceBookingEvent } from "@/models/travel-desk-invoice"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"
import logger from "@/utils/logger"

export class SourceUnavailableError extends Error {}

export function normalizeRecordLocator(value: string): string {
  const recordLocator = value.trim().toUpperCase()
  if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
    throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
  }

  return recordLocator
}

function trimSourceValue(value: string | null): string | null {
  if (isNil(value)) return null

  return value.trim()
}

function formatSourceTimestamp(value: Date | null): string | null {
  if (isNil(value)) return null

  return value.toISOString()
}

export class SourceService {
  static async perform(recordLocator: string): Promise<InvoiceBookingEvent[]> {
    const normalizedRecordLocator = normalizeRecordLocator(recordLocator)

    if (!TRAVELPORT_DB_HOST || !TRAVELPORT_DB_NAME || !TRAVELPORT_DB_USER) {
      throw new SourceUnavailableError("Booking source is not configured.")
    }

    try {
      const bookingEvents = await TravelOrderEvent.findAllByRecordLocator(normalizedRecordLocator)

      return bookingEvents.map((bookingEvent) => ({
        travelOrderIdentifier: bookingEvent.travelOrderIdentifier,
        bookingFileVersionNumber: bookingEvent.bookingFileVersionNumber,
        eventType: trimSourceValue(bookingEvent.eventType),
        recordLocator: trimSourceValue(bookingEvent.recordLocator),
        crsDescription: trimSourceValue(bookingEvent.crsDescription),
        databaseTimestamp: bookingEvent.databaseTimestamp.toISOString(),
        hostEventTimestamp: formatSourceTimestamp(bookingEvent.hostEventTimestamp),
        pnrCreationDate: formatSourceTimestamp(bookingEvent.pnrCreationDate),
        owningAgencyName: trimSourceValue(bookingEvent.owningAgencyName),
        transactionAgencyName: trimSourceValue(bookingEvent.transactionAgencyName),
        transactionAgent: trimSourceValue(bookingEvent.transactionAgent),
        creatingAgencyIata: trimSourceValue(bookingEvent.creatingAgencyIata),
        passengers: (bookingEvent.passengers ?? []).map((passenger) => ({
          lastNameElement: passenger.lastNameElement,
          passengerElement: passenger.passengerElement,
          firstName: trimSourceValue(passenger.firstName),
          lastName: trimSourceValue(passenger.lastName),
        })),
        airReservationSegments: (bookingEvent.airReservationSegments ?? []).map((segment) => ({
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
        serviceFeeTransaction: isNil(bookingEvent.serviceFeeTransaction)
          ? null
          : {
              activeVoidStatus: trimSourceValue(
                bookingEvent.serviceFeeTransaction.activeVoidStatus
              ),
              serviceFeeDocumentNumber: trimSourceValue(
                bookingEvent.serviceFeeTransaction.serviceFeeDocumentNumber
              ),
              issueDate: trimSourceValue(bookingEvent.serviceFeeTransaction.issueDate),
              currencyCode: trimSourceValue(bookingEvent.serviceFeeTransaction.currencyCode),
              serviceFeeAmount: bookingEvent.serviceFeeTransaction.serviceFeeAmount,
              commissionAmount: bookingEvent.serviceFeeTransaction.commissionAmount,
              nameOnServiceFee: trimSourceValue(
                bookingEvent.serviceFeeTransaction.nameOnServiceFee
              ),
              relatedTicketDocumentNumber: trimSourceValue(
                bookingEvent.serviceFeeTransaction.relatedTicketDocumentNumber
              ),
              relatedInvoiceNumber: trimSourceValue(
                bookingEvent.serviceFeeTransaction.relatedInvoiceNumber
              ),
            },
      }))
    } catch (error) {
      logger.error("Travelport booking source lookup failed.", { error })
      throw new SourceUnavailableError("Booking source is unavailable.")
    }
  }
}

export default SourceService
