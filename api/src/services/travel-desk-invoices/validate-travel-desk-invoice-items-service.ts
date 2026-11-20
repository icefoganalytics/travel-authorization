import { isEmpty, isNil } from "lodash"

import { TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

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
  private readonly travelDeskInvoiceItemProductTypes: ReadonlyArray<
    TravelDeskInvoiceItem["productType"]
  > = Object.values(TravelDeskInvoiceItem.ProductTypes)

  constructor(
    protected travelDeskInvoiceItemsAttributes: ReadonlyArray<
      Pick<
        TravelDeskInvoiceItemAttributes,
        "productType" | "sourceAirSegmentNumber" | "sourceServiceFeeEventExternalIdentifier"
      >
    >,
    protected sourceAirSegmentNumbers: number[],
    protected savedSourceServiceFeeEventExternalIdentifiers?: number[]
  ) {
    super()
  }

  perform(): ReadonlySet<number> {
    if (isEmpty(this.travelDeskInvoiceItemsAttributes)) {
      throw new ServiceValidationError("At least one invoice item is required.")
    }

    let expectedSourceServiceFeeEventExternalIdentifiers: Set<number> | undefined
    if (!isNil(this.savedSourceServiceFeeEventExternalIdentifiers)) {
      expectedSourceServiceFeeEventExternalIdentifiers = new Set(
        this.savedSourceServiceFeeEventExternalIdentifiers
      )
      if (
        expectedSourceServiceFeeEventExternalIdentifiers.size !==
        this.savedSourceServiceFeeEventExternalIdentifiers.length
      ) {
        throw new ServiceValidationError("Service fee events cannot be selected more than once.")
      }
    }

    const expectedSourceAirSegmentNumbers = new Set(this.sourceAirSegmentNumbers)
    const seenSourceAirSegmentNumbers = new Set<number>()
    const seenSourceServiceFeeEventExternalIdentifiers = new Set<number>()

    for (const {
      productType,
      sourceAirSegmentNumber,
      sourceServiceFeeEventExternalIdentifier,
    } of this.travelDeskInvoiceItemsAttributes) {
      this.assertTravelDeskInvoiceItemProductType(productType)
      this.assertSourceAirSegmentNumber(
        sourceAirSegmentNumber,
        productType,
        expectedSourceAirSegmentNumbers,
        seenSourceAirSegmentNumbers
      )
      this.assertSourceServiceFeeEventExternalIdentifier(
        sourceServiceFeeEventExternalIdentifier,
        productType,
        expectedSourceServiceFeeEventExternalIdentifiers,
        seenSourceServiceFeeEventExternalIdentifiers
      )
    }

    if (seenSourceAirSegmentNumbers.size !== expectedSourceAirSegmentNumbers.size) {
      throw new ServiceValidationError(
        "Every selected flight segment must be represented exactly once."
      )
    }

    if (
      !isNil(expectedSourceServiceFeeEventExternalIdentifiers) &&
      seenSourceServiceFeeEventExternalIdentifiers.size !==
      expectedSourceServiceFeeEventExternalIdentifiers.size
    ) {
      throw new ServiceValidationError(
        "Every selected service fee must be represented exactly once."
      )
    }

    return seenSourceServiceFeeEventExternalIdentifiers
  }

  private assertTravelDeskInvoiceItemProductType(
    productType: TravelDeskInvoiceItem["productType"]
  ): void {
    if (!this.travelDeskInvoiceItemProductTypes.includes(productType)) {
      throw new ServiceValidationError(
        `Product type must be one of: ${this.travelDeskInvoiceItemProductTypes.join(", ")}`
      )
    }
  }

  private assertSourceAirSegmentNumber(
    sourceAirSegmentNumber: number | null | undefined,
    productType: TravelDeskInvoiceItem["productType"],
    expectedSourceAirSegmentNumbers: Set<number>,
    seenSourceAirSegmentNumbers: Set<number>
  ): void {
    if (isNil(sourceAirSegmentNumber)) return

    if (!expectedSourceAirSegmentNumbers.has(sourceAirSegmentNumber)) {
      throw new ServiceValidationError("Invoice item refers to an unselected flight segment.")
    }

    if (seenSourceAirSegmentNumbers.has(sourceAirSegmentNumber)) {
      throw new ServiceValidationError("A selected flight segment can only appear once.")
    }

    if (productType !== TravelDeskInvoiceItem.ProductTypes.AIR) {
      throw new ServiceValidationError("Flight segments require the Air product type.")
    }

    seenSourceAirSegmentNumbers.add(sourceAirSegmentNumber)
  }

  private assertSourceServiceFeeEventExternalIdentifier(
    sourceServiceFeeEventExternalIdentifier: number | null | undefined,
    productType: TravelDeskInvoiceItem["productType"],
    expectedSourceServiceFeeEventExternalIdentifiers: Set<number> | undefined,
    seenSourceServiceFeeEventExternalIdentifiers: Set<number>
  ): void {
    if (isNil(sourceServiceFeeEventExternalIdentifier)) return

    if (
      !isNil(expectedSourceServiceFeeEventExternalIdentifiers) &&
      !expectedSourceServiceFeeEventExternalIdentifiers.has(sourceServiceFeeEventExternalIdentifier)
    ) {
      throw new ServiceValidationError("Invoice item refers to an unselected service fee.")
    }

    if (seenSourceServiceFeeEventExternalIdentifiers.has(sourceServiceFeeEventExternalIdentifier)) {
      throw new ServiceValidationError("A selected service fee can only appear once.")
    }

    if (productType !== TravelDeskInvoiceItem.ProductTypes.SERVICE_FEE) {
      throw new ServiceValidationError("Service fees require the Service Fee product type.")
    }

    seenSourceServiceFeeEventExternalIdentifiers.add(sourceServiceFeeEventExternalIdentifier)
  }
}

export default ValidateTravelDeskInvoiceItemsService
