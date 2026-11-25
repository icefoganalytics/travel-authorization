import { type CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, type TravelDeskTravelRequest } from "@/models"

import { TravelDeskInvoiceItems, TravelDeskInvoices } from "@/services"
import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

import { LoadAndValidateTravelDeskBookingEventForInvoiceService } from "@/services/travel-desk-invoices/load-and-validate-travel-desk-booking-event-for-invoice-service"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoice-items/validate-travel-desk-invoice-items-service"
import { ValidateTravelDeskInvoiceServiceFeeSelectionService } from "@/services/travel-desk-invoices/validate-travel-desk-invoice-service-fee-selection-service"

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
        externalBookingEventIdentifier,
        currencyCode,
        travelDeskInvoiceItemsAttributes
      )
      const grossAmount = TravelDeskInvoices.CalculateTotalService.perform(
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
    externalBookingEventIdentifier: number,
    currencyCode: string,
    travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[]
  ): Promise<string> {
    const { bookingReference, sourceAirSegmentNumbers } =
      await LoadAndValidateTravelDeskBookingEventForInvoiceService.perform(externalBookingEventIdentifier)

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
}

export default CreateService
