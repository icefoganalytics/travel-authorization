import { isEmpty, isNil } from "lodash"

import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import TravelDeskInvoiceValidationError from "@/services/travel-desk-invoices/invoice-validation-error"

export type TravelDeskInvoiceItemAttributes = {
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

export class ValidateTravelDeskInvoiceItemsService extends BaseService {
  constructor(
    protected travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[],
    protected sourceAirSegmentNumbers: number[],
    protected serviceFeeEventIds: number[]
  ) {
    super()
  }

  perform(): void {
    if (isEmpty(this.travelDeskInvoiceItemsAttributes)) {
      throw new TravelDeskInvoiceValidationError("At least one invoice item is required.")
    }

    const expectedFeeEventIds = new Set(this.serviceFeeEventIds)
    if (expectedFeeEventIds.size !== this.serviceFeeEventIds.length) {
      throw new TravelDeskInvoiceValidationError("Service fee events cannot be selected more than once.")
    }

    const expectedSegmentNumbers = new Set(this.sourceAirSegmentNumbers)
    const seenSegmentNumbers = new Set<number>()
    const seenFeeEventIds = new Set<number>()
    const productTypes = Object.values(TravelDeskInvoiceItem.ProductTypes)

    for (const travelDeskInvoiceItemAttributes of this.travelDeskInvoiceItemsAttributes) {
      if (!productTypes.some((productType) => productType === travelDeskInvoiceItemAttributes.productType)) {
        throw new TravelDeskInvoiceValidationError(`Product type must be one of: ${productTypes.join(", ")}`)
      }

      if (!isNil(travelDeskInvoiceItemAttributes.sourceAirSegmentNumber)) {
        if (!expectedSegmentNumbers.has(travelDeskInvoiceItemAttributes.sourceAirSegmentNumber)) {
          throw new TravelDeskInvoiceValidationError("Invoice item refers to an unselected flight segment.")
        }

        if (seenSegmentNumbers.has(travelDeskInvoiceItemAttributes.sourceAirSegmentNumber)) {
          throw new TravelDeskInvoiceValidationError("A selected flight segment can only appear once.")
        }

        if (travelDeskInvoiceItemAttributes.productType !== TravelDeskInvoiceItem.ProductTypes.AIR) {
          throw new TravelDeskInvoiceValidationError("Flight segments require the Air product type.")
        }

        seenSegmentNumbers.add(travelDeskInvoiceItemAttributes.sourceAirSegmentNumber)
      }

      if (!isNil(travelDeskInvoiceItemAttributes.sourceServiceFeeEventExternalIdentifier)) {
        if (!expectedFeeEventIds.has(travelDeskInvoiceItemAttributes.sourceServiceFeeEventExternalIdentifier)) {
          throw new TravelDeskInvoiceValidationError("Invoice item refers to an unselected service fee.")
        }

        if (seenFeeEventIds.has(travelDeskInvoiceItemAttributes.sourceServiceFeeEventExternalIdentifier)) {
          throw new TravelDeskInvoiceValidationError("A selected service fee can only appear once.")
        }

        if (travelDeskInvoiceItemAttributes.productType !== TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE) {
          throw new TravelDeskInvoiceValidationError("Service fees require the Service Fee product type.")
        }

        seenFeeEventIds.add(travelDeskInvoiceItemAttributes.sourceServiceFeeEventExternalIdentifier)
      }
    }

    if (seenSegmentNumbers.size !== expectedSegmentNumbers.size) {
      throw new TravelDeskInvoiceValidationError(
        "Every selected flight segment must be represented exactly once."
      )
    }

    if (seenFeeEventIds.size !== expectedFeeEventIds.size) {
      throw new TravelDeskInvoiceValidationError(
        "Every selected service fee must be represented exactly once."
      )
    }
  }
}

export default ValidateTravelDeskInvoiceItemsService
