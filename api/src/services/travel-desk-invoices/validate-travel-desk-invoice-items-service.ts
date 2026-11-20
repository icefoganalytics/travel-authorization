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
  private readonly productTypes: ReadonlyArray<TravelDeskInvoiceItem["productType"]> = Object.values(
    TravelDeskInvoiceItem.ProductTypes
  )

  constructor(
    protected travelDeskInvoiceItemsAttributes: ReadonlyArray<
      Pick<
        TravelDeskInvoiceItemAttributes,
        "productType" | "sourceAirSegmentNumber" | "sourceServiceFeeEventExternalIdentifier"
      >
    >,
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

    for (const {
      productType,
      sourceAirSegmentNumber,
      sourceServiceFeeEventExternalIdentifier,
    } of this.travelDeskInvoiceItemsAttributes) {
      this.assertProductType(productType)
      this.assertSourceAirSegmentNumber(
        sourceAirSegmentNumber,
        productType,
        expectedSegmentNumbers,
        seenSegmentNumbers
      )
      this.assertSourceServiceFeeEventExternalIdentifier(
        sourceServiceFeeEventExternalIdentifier,
        productType,
        expectedFeeEventIds,
        seenFeeEventIds
      )
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

  private assertProductType(productType: TravelDeskInvoiceItem["productType"]): void {
    if (!this.productTypes.includes(productType)) {
      throw new TravelDeskInvoiceValidationError(`Product type must be one of: ${this.productTypes.join(", ")}`)
    }
  }

  private assertSourceAirSegmentNumber(
    sourceAirSegmentNumber: number | null | undefined,
    productType: TravelDeskInvoiceItem["productType"],
    expectedSegmentNumbers: Set<number>,
    seenSegmentNumbers: Set<number>
  ): void {
    if (isNil(sourceAirSegmentNumber)) return

    if (!expectedSegmentNumbers.has(sourceAirSegmentNumber)) {
      throw new TravelDeskInvoiceValidationError("Invoice item refers to an unselected flight segment.")
    }

    if (seenSegmentNumbers.has(sourceAirSegmentNumber)) {
      throw new TravelDeskInvoiceValidationError("A selected flight segment can only appear once.")
    }

    if (productType !== TravelDeskInvoiceItem.ProductTypes.AIR) {
      throw new TravelDeskInvoiceValidationError("Flight segments require the Air product type.")
    }

    seenSegmentNumbers.add(sourceAirSegmentNumber)
  }

  private assertSourceServiceFeeEventExternalIdentifier(
    sourceServiceFeeEventExternalIdentifier: number | null | undefined,
    productType: TravelDeskInvoiceItem["productType"],
    expectedFeeEventIds: Set<number>,
    seenFeeEventIds: Set<number>
  ): void {
    if (isNil(sourceServiceFeeEventExternalIdentifier)) return

    if (!expectedFeeEventIds.has(sourceServiceFeeEventExternalIdentifier)) {
      throw new TravelDeskInvoiceValidationError("Invoice item refers to an unselected service fee.")
    }

    if (seenFeeEventIds.has(sourceServiceFeeEventExternalIdentifier)) {
      throw new TravelDeskInvoiceValidationError("A selected service fee can only appear once.")
    }

    if (productType !== TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE) {
      throw new TravelDeskInvoiceValidationError("Service fees require the Service Fee product type.")
    }

    seenFeeEventIds.add(sourceServiceFeeEventExternalIdentifier)
  }
}

export default ValidateTravelDeskInvoiceItemsService
