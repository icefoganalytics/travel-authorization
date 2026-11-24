import { type CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"

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
      const travelDeskTravelRequest = await this.loadActiveTravelDeskTravelRequest(
        this.travelDeskTravelRequest.id
      )
      const linkedBookingReference =
        RequireLinkedTravelPortBookingService.perform(travelDeskTravelRequest)

      const { bookingReference, sourceAirSegmentNumbers } =
        await LoadAndValidateTravelDeskBookingEventForInvoiceService.perform(
          externalBookingEventIdentifier
        )
      if (bookingReference !== linkedBookingReference) {
        throw new ServiceValidationError("Invoice booking must match the linked Travelport booking.")
      }

      const sourceServiceFeeEventExternalIdentifiers = ValidateTravelDeskInvoiceItemsService.perform(
        travelDeskInvoiceItemsAttributes,
        sourceAirSegmentNumbers
      )
      await ValidateTravelDeskInvoiceServiceFeeSelectionService.perform(
        bookingReference,
        sourceServiceFeeEventExternalIdentifiers,
        currencyCode
      )

      const grossAmount = CalculateTotalService.perform(travelDeskInvoiceItemsAttributes)

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
      await BulkCreateService.perform(travelDeskInvoice, travelDeskInvoiceItemsAttributes)

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
}

export default CreateService
