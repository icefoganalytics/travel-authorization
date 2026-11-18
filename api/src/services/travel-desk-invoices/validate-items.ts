import { isEmpty, isNil } from "lodash"

import { TravelDeskInvoiceItem } from "@/models"
import { type InvoiceBookingContext } from "@/models/travel-desk-invoice"

import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export type InvoiceItemAttributes = {
  productType: TravelDeskInvoiceItem["productType"]
  travelDeskFlightSegmentId?: number | null
  sourceAirSegmentNumber?: number | null
  sourceServiceFeeEventExternalIdentifier?: number | null
  passengerName?: string | null
  ticketNumber?: string | null
  vendor?: string | null
  description?: string | null
  saleType: TravelDeskInvoiceItem["saleType"]
  grossAmount: string
  position: number
}

export async function validateInvoiceItems(
  items: InvoiceItemAttributes[],
  bookingContext: InvoiceBookingContext,
  serviceFeeEventIds: number[],
  currencyCode: string
): Promise<void> {
  if (isEmpty(items)) {
    throw new InvoiceValidationError("At least one invoice item is required.")
  }

  if (new Set(serviceFeeEventIds).size !== serviceFeeEventIds.length) {
    throw new InvoiceValidationError("Service fee events cannot be selected more than once.")
  }

  const expectedSegmentNumbers = new Set(
    bookingContext.bookingEvent.airReservationSegments.map((segment) => segment.airSegmentNumber)
  )
  const expectedFeeEventIds = new Set(serviceFeeEventIds)
  const seenSegmentNumbers = new Set<number>()
  const seenFeeEventIds = new Set<number>()
  const productTypes = Object.values(TravelDeskInvoiceItem.ProductTypes)

  for (const item of items) {
    if (!productTypes.some((productType) => productType === item.productType)) {
      throw new InvoiceValidationError(`Product type must be one of: ${productTypes.join(", ")}`)
    }

    if (!isNil(item.sourceAirSegmentNumber)) {
      if (!expectedSegmentNumbers.has(item.sourceAirSegmentNumber)) {
        throw new InvoiceValidationError("Invoice item refers to an unselected flight segment.")
      }

      if (seenSegmentNumbers.has(item.sourceAirSegmentNumber)) {
        throw new InvoiceValidationError("A selected flight segment can only appear once.")
      }

      if (item.productType !== TravelDeskInvoiceItem.ProductTypes.AIR) {
        throw new InvoiceValidationError("Flight segments require the Air product type.")
      }

      seenSegmentNumbers.add(item.sourceAirSegmentNumber)
    }

    if (!isNil(item.sourceServiceFeeEventExternalIdentifier)) {
      if (!expectedFeeEventIds.has(item.sourceServiceFeeEventExternalIdentifier)) {
        throw new InvoiceValidationError("Invoice item refers to an unselected service fee.")
      }

      if (seenFeeEventIds.has(item.sourceServiceFeeEventExternalIdentifier)) {
        throw new InvoiceValidationError("A selected service fee can only appear once.")
      }

      if (item.productType !== TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE) {
        throw new InvoiceValidationError("Service fees require the Service Fee product type.")
      }

      seenFeeEventIds.add(item.sourceServiceFeeEventExternalIdentifier)
    }
  }

  if (seenSegmentNumbers.size !== expectedSegmentNumbers.size) {
    throw new InvoiceValidationError(
      "Every selected flight segment must be represented exactly once."
    )
  }

  if (seenFeeEventIds.size !== expectedFeeEventIds.size) {
    throw new InvoiceValidationError("Every selected service fee must be represented exactly once.")
  }

  const feeEvents = new Map<number, InvoiceBookingContext["bookingEvent"]>(
    bookingContext.serviceFeeEvents.map((event) => [event.travelOrderIdentifier, event])
  )
  const documentNumbers = new Set<string>()

  for (const eventId of serviceFeeEventIds) {
    const feeEvent = feeEvents.get(eventId)
    const fee = feeEvent?.serviceFeeTransaction

    if (isNil(fee)) {
      throw new InvoiceValidationError("Selected event does not contain a service fee.")
    }

    if (!isNil(fee.currencyCode) && fee.currencyCode !== currencyCode) {
      throw new InvoiceValidationError(
        "Selected service fee currency must match the invoice currency."
      )
    }

    if (!isNil(fee.serviceFeeDocumentNumber) && !isEmpty(fee.serviceFeeDocumentNumber)) {
      if (documentNumbers.has(fee.serviceFeeDocumentNumber)) {
        throw new InvoiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }

      documentNumbers.add(fee.serviceFeeDocumentNumber)
    }
  }
}

export default validateInvoiceItems
