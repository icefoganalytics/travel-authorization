import { type CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"

import { TravelDeskInvoiceItems } from "@/services"
import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoice-items"
import {
  CalculateTotalService,
  LoadAndValidateTravelDeskBookingEventForInvoiceService,
  ValidateTravelDeskInvoiceServiceFeeSelectionService,
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
      await LoadAndValidateTravelDeskBookingEventForInvoiceService.perform(
        externalBookingEventIdentifier
      )
    if (bookingReference !== linkedBookingReference) {
      throw new ServiceValidationError("Invoice booking must match the linked Travelport booking.")
    }

    const sourceServiceFeeEventExternalIdentifiers =
      TravelDeskInvoiceItems.ValidateTravelDeskInvoiceItemsService.perform(
        travelDeskInvoiceItemsAttributes,
        sourceAirSegmentNumbers
      )
    await ValidateTravelDeskInvoiceServiceFeeSelectionService.perform(
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
}

export default CreateService
