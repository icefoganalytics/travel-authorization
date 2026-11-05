import { isEmpty, isNil } from "lodash"

import { type InvoiceBookingEvent, type InvoiceSourceSnapshot } from "@/models/travel-desk-invoice"
import { TravelDeskProductType } from "@/models"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"

export type InvoiceItemAttributes = {
  travelDeskProductTypeId: number
  travelDeskFlightSegmentId?: number | null
  sourceAirSegmentNumber?: number | null
  sourceServiceFeeEventId?: number | null
  passengerName?: string | null
  ticketNumber?: string | null
  vendor?: string | null
  description?: string | null
  saleType: "Sale" | "Refund" | "Void"
  grossAmount: string
  position: number
}

export async function validateInvoiceItems(
  items: InvoiceItemAttributes[],
  snapshot: InvoiceSourceSnapshot,
  serviceFeeEventIds: number[],
  currencyCode: string
): Promise<void> {
  if (isEmpty(items)) throw new InvoiceValidationError("At least one invoice item is required.")
  if (new Set(serviceFeeEventIds).size !== serviceFeeEventIds.length) {
    throw new InvoiceValidationError("Service fee events cannot be selected more than once.")
  }

  const expectedSegmentNumbers = new Set(
    snapshot.bookingEvent.airReservationSegments.map((segment) => segment.airSegmentNumber)
  )
  const expectedFeeEventIds = new Set(serviceFeeEventIds)
  const seenSegmentNumbers = new Set<number>()
  const seenFeeEventIds = new Set<number>()
  const productTypeIds = [...new Set(items.map((item) => item.travelDeskProductTypeId))]
  const productTypes = await TravelDeskProductType.findAll({ where: { id: productTypeIds } })
  const productTypesById = new Map<number, TravelDeskProductType>(
    productTypes.map((productType) => [productType.id, productType])
  )

  for (const item of items) {
    const productType = productTypesById.get(item.travelDeskProductTypeId)

    if (isNil(productType) || !isNil(productType.deletedAt)) {
      throw new InvoiceValidationError("Every invoice item must use an active product type.")
    }

    if (!isNil(item.sourceAirSegmentNumber)) {
      if (!expectedSegmentNumbers.has(item.sourceAirSegmentNumber)) {
        throw new InvoiceValidationError("Invoice item refers to an unselected flight segment.")
      }
      if (seenSegmentNumbers.has(item.sourceAirSegmentNumber)) {
        throw new InvoiceValidationError("A selected flight segment can only appear once.")
      }
      if (productType.code !== "air") {
        throw new InvoiceValidationError("Flight segments require the Air product type.")
      }
      seenSegmentNumbers.add(item.sourceAirSegmentNumber)
    }

    if (!isNil(item.sourceServiceFeeEventId)) {
      if (!expectedFeeEventIds.has(item.sourceServiceFeeEventId)) {
        throw new InvoiceValidationError("Invoice item refers to an unselected service fee.")
      }
      if (seenFeeEventIds.has(item.sourceServiceFeeEventId)) {
        throw new InvoiceValidationError("A selected service fee can only appear once.")
      }
      if (productType.code !== "service-fee") {
        throw new InvoiceValidationError("Service fees require the Service Fee product type.")
      }
      seenFeeEventIds.add(item.sourceServiceFeeEventId)
    }

    if (!isNil(item.sourceAirSegmentNumber) && !isNil(item.sourceServiceFeeEventId)) {
      throw new InvoiceValidationError(
        "An item cannot refer to both a flight segment and service fee."
      )
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

  const snapshotFees = new Map<number, InvoiceBookingEvent>(
    snapshot.serviceFeeEvents.map((event) => [event.travelOrderIdentifier, event])
  )
  const documentNumbers = new Set<string>()

  for (const eventId of serviceFeeEventIds) {
    const feeEvent = snapshotFees.get(eventId)
    const fee = feeEvent?.serviceFeeTransaction

    if (isNil(fee))
      throw new InvoiceValidationError("Selected event does not contain a service fee.")
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
