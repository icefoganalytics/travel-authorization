import { type CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, type TravelDeskTravelRequest } from "@/models"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import ServiceValidationError from "@/services/service-validation-error"
import {
  BulkCreateService,
  ValidateLinkedTravelDeskFlightSegmentsService,
} from "@/services/travel-desk-invoice-items"
import {
  ValidateTravelDeskInvoiceItemsService,
  type TravelDeskInvoiceItemAttributes,
} from "@/services/travel-desk-invoices/validate-travel-desk-invoice-items-service"
import ValidateTravelDeskInvoiceServiceFeeSelectionService from "@/services/travel-desk-invoices/validate-travel-desk-invoice-service-fee-selection-service"
import LoadAndValidateTravelDeskBookingEventForInvoiceService from "@/services/travel-desk-invoices/load-and-validate-travel-desk-booking-event-for-invoice-service"

export type TravelDeskInvoiceCreationAttributes = Partial<
  CreationAttributes<TravelDeskInvoice> & {
    sourceServiceFeeEventExternalIdentifiers: number[]
    items: TravelDeskInvoiceItemAttributes[]
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
    return db.transaction(async () => {
      const {
        externalBookingEventIdentifier,
        sourceServiceFeeEventExternalIdentifiers,
        currencyCode,
        travelDeskInvoiceItemsAttributes,
        optionalAttributes,
      } = this.validateInvoiceCreationAttributes()
      const { bookingReference, sourceAirSegmentNumbers } =
        await LoadAndValidateTravelDeskBookingEventForInvoiceService.perform(externalBookingEventIdentifier)

      await ValidateTravelDeskInvoiceServiceFeeSelectionService.perform(
        bookingReference,
        sourceServiceFeeEventExternalIdentifiers,
        currencyCode
      )
      const grossAmount = CalculateTotalService.perform(travelDeskInvoiceItemsAttributes)

      ValidateTravelDeskInvoiceItemsService.perform(
        travelDeskInvoiceItemsAttributes,
        sourceAirSegmentNumbers,
        sourceServiceFeeEventExternalIdentifiers
      )
      await ValidateLinkedTravelDeskFlightSegmentsService.perform(
        this.travelDeskTravelRequest.id,
        travelDeskInvoiceItemsAttributes
      )

      const travelDeskInvoice = await TravelDeskInvoice.create({
        ...optionalAttributes,
        travelDeskTravelRequestId: this.travelDeskTravelRequest.id,
        bookingReference,
        externalBookingEventIdentifier,
        currencyCode,
        grossAmount,
      })
      await BulkCreateService.perform(travelDeskInvoice.id, travelDeskInvoiceItemsAttributes)

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

  private validateInvoiceCreationAttributes() {
    const {
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode,
      items: travelDeskInvoiceItemsAttributes,
      ...optionalAttributes
    } = this.travelDeskInvoiceCreationAttributes
    if (isNil(externalBookingEventIdentifier)) {
      throw new ServiceValidationError({
        field: "externalBookingEventIdentifier",
        text: "Booking event is required.",
      })
    }

    if (!Array.isArray(sourceServiceFeeEventExternalIdentifiers)) {
      throw new ServiceValidationError({
        field: "sourceServiceFeeEventExternalIdentifiers",
        text: "Service fee events must be an array.",
      })
    }

    if (isNil(currencyCode)) {
      throw new ServiceValidationError({
        field: "currencyCode",
        text: "Currency code is required.",
      })
    }

    if (!Array.isArray(travelDeskInvoiceItemsAttributes)) {
      throw new ServiceValidationError({
        field: "items",
        text: "Invoice items must be an array.",
      })
    }

    return {
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode,
      travelDeskInvoiceItemsAttributes,
      optionalAttributes,
    }
  }
}

export default CreateService
