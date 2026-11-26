import { type CreationAttributes, Op } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskBookingEvent, TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"

import { TravelDeskInvoiceItems } from "@/services"
import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoice-items"
import {
  CalculateTotalService,
  LoadInvoiceBookingSourceService,
} from "@/services/travel-desk-invoices"
import { RequireLinkedTravelPortBookingService } from "@/services/travel-desk-travel-requests/require-linked-travel-port-booking-service"

export type TravelDeskInvoiceCreationAttributes = Partial<
  CreationAttributes<TravelDeskInvoice> & {
    itemsAttributes: TravelDeskInvoiceItemAttributes[]
  }
>

export class CreateService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected travelDeskInvoiceCreationAttributes: TravelDeskInvoiceCreationAttributes
  ) {
    super()
  }

  async perform(): Promise<TravelDeskInvoice> {
    const {
      externalBookingEventIdentifier,
      currencyCode,
      itemsAttributes: travelDeskInvoiceItemsAttributes,
      ...optionalAttributes
    } = this.travelDeskInvoiceCreationAttributes
    if (isNil(externalBookingEventIdentifier)) {
      throw new ServiceValidationError("Booking event is required.")
    }

    if (isNil(currencyCode)) {
      throw new ServiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(travelDeskInvoiceItemsAttributes)) {
      throw new ServiceValidationError("Invoice items must be an array.")
    }

    return db.transaction(async () => {
      const bookingReference = await this.validateInvoiceBookingAndItems(
        this.travelDeskTravelRequest.id,
        externalBookingEventIdentifier,
        currencyCode,
        travelDeskInvoiceItemsAttributes
      )
      const grossAmount = CalculateTotalService.perform(travelDeskInvoiceItemsAttributes)

      const travelDeskInvoice = await TravelDeskInvoice.create({
        ...optionalAttributes,
        travelDeskTravelRequestId: this.travelDeskTravelRequest.id,
        bookingReference,
        externalBookingEventIdentifier,
        currencyCode,
        grossAmount,
      })
      await TravelDeskInvoiceItems.BulkCreateService.perform(
        travelDeskInvoice,
        travelDeskInvoiceItemsAttributes
      )

      return travelDeskInvoice.reload({
        include: [
          {
            association: "items",
            separate: true,
            order: [
              ["position", "ASC"],
              ["id", "ASC"],
            ],
          },
        ],
      })
    })
  }

  private async validateInvoiceBookingAndItems(
    travelDeskTravelRequestId: number,
    externalBookingEventIdentifier: number,
    currencyCode: string,
    travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ): Promise<string> {
    const travelDeskTravelRequest = await this.loadActiveTravelDeskTravelRequest(
      travelDeskTravelRequestId
    )
    const linkedBookingReference =
      RequireLinkedTravelPortBookingService.perform(travelDeskTravelRequest)

    const { bookingReference, sourceAirSegmentNumbers } =
      await LoadInvoiceBookingSourceService.perform(externalBookingEventIdentifier)
    if (bookingReference !== linkedBookingReference) {
      throw new ServiceValidationError("Invoice booking must match the linked Travelport booking.")
    }

    TravelDeskInvoiceItems.AssertInvoiceItemsMatchSourcesService.perform(
      travelDeskInvoiceItemsAttributes,
      sourceAirSegmentNumbers
    )

    const sourceServiceFeeEventExternalIdentifiers: number[] = []
    for (const { sourceServiceFeeEventExternalIdentifier } of travelDeskInvoiceItemsAttributes) {
      if (!isNil(sourceServiceFeeEventExternalIdentifier)) {
        sourceServiceFeeEventExternalIdentifiers.push(sourceServiceFeeEventExternalIdentifier)
      }
    }
    await this.assertSelectedFeesCanBeInvoicedTogether(
      bookingReference,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode
    )

    return bookingReference
  }

  private async loadActiveTravelDeskTravelRequest(
    travelDeskTravelRequestId: number
  ): Promise<TravelDeskTravelRequest> {
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId, {
      lock: true,
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new ServiceValidationError("Travel desk travel request does not exist.")
    }

    return travelDeskTravelRequest
  }

  private async assertSelectedFeesCanBeInvoicedTogether(
    bookingReference: string,
    sourceServiceFeeEventExternalIdentifiers: readonly number[],
    invoiceCurrencyCode: string
  ): Promise<void> {
    if (sourceServiceFeeEventExternalIdentifiers.length === 0) {
      return
    }

    const selectedTravelDeskBookingEvents = await TravelDeskBookingEvent.findAll({
      attributes: ["serviceFeeTransaction"],
      where: {
        bookingReference,
        externalTravelPortIdentifier: {
          [Op.in]: sourceServiceFeeEventExternalIdentifiers,
        },
      },
    })
    if (
      selectedTravelDeskBookingEvents.length !== sourceServiceFeeEventExternalIdentifiers.length
    ) {
      throw new ServiceValidationError(
        "Every selected service fee must belong to this booking reference."
      )
    }

    const serviceFeeDocumentNumbers = new Set<string>()
    for (const { serviceFeeTransaction } of selectedTravelDeskBookingEvents) {
      if (isNil(serviceFeeTransaction)) {
        throw new ServiceValidationError("The selected booking event has no service fee.")
      }

      const { currencyCode, serviceFeeDocumentNumber } = serviceFeeTransaction
      if (!isNil(currencyCode) && currencyCode !== invoiceCurrencyCode) {
        throw new ServiceValidationError(
          "Selected service fee currency must match the invoice currency."
        )
      }

      if (isNil(serviceFeeDocumentNumber) || isEmpty(serviceFeeDocumentNumber)) continue

      if (serviceFeeDocumentNumbers.has(serviceFeeDocumentNumber)) {
        throw new ServiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }
      serviceFeeDocumentNumbers.add(serviceFeeDocumentNumber)
    }
  }
}

export default CreateService
