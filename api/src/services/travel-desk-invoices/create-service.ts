import { type CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskBookingEvent, TravelDeskInvoice, type TravelDeskTravelRequest } from "@/models"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import TravelDeskInvoiceValidationError from "@/services/travel-desk-invoices/invoice-validation-error"
import {
  BulkCreateService,
  ValidateLinkedTravelDeskFlightSegmentsService,
} from "@/services/travel-desk-invoice-items"
import {
  ValidateTravelDeskInvoiceItemsService,
  type TravelDeskInvoiceItemAttributes,
} from "@/services/travel-desk-invoices/validate-travel-desk-invoice-items-service"
import ValidateTravelDeskInvoiceServiceFeeSelectionService from "@/services/travel-desk-invoices/validate-travel-desk-invoice-service-fee-selection-service"

export type TravelDeskInvoiceCreationAttributes = Partial<
  Omit<CreationAttributes<TravelDeskInvoice>, "bookingReference"> & {
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
    const {
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode,
      items: travelDeskInvoiceItemsAttributes,
      ...optionalAttributes
    } = this.travelDeskInvoiceCreationAttributes
    if (isNil(externalBookingEventIdentifier)) {
      throw new TravelDeskInvoiceValidationError("Booking event is required.")
    }

    if (!Array.isArray(sourceServiceFeeEventExternalIdentifiers)) {
      throw new TravelDeskInvoiceValidationError("Service fee events must be an array.")
    }

    if (isNil(currencyCode)) {
      throw new TravelDeskInvoiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(travelDeskInvoiceItemsAttributes)) {
      throw new TravelDeskInvoiceValidationError("Invoice items must be an array.")
    }

    const travelDeskBookingEvent = await this.loadTravelDeskBookingEvent(externalBookingEventIdentifier)
    const { bookingReference } = travelDeskBookingEvent
    if (isNil(bookingReference)) {
      throw new TravelDeskInvoiceValidationError("The selected booking event has no booking reference.")
    }

    await ValidateTravelDeskInvoiceServiceFeeSelectionService.perform(
      bookingReference,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode
    )
    const grossAmount = CalculateTotalService.perform(travelDeskInvoiceItemsAttributes)

    return db.transaction(async () => {
      ValidateTravelDeskInvoiceItemsService.perform(
        travelDeskInvoiceItemsAttributes,
        travelDeskBookingEvent.airReservationSegments.map(({ airSegmentNumber }) => airSegmentNumber),
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

  private async loadTravelDeskBookingEvent(
    externalBookingEventIdentifier: number
  ): Promise<TravelDeskBookingEvent> {
    const travelDeskBookingEvent = await TravelDeskBookingEvent.findOne({
      where: {
        externalTravelPortIdentifier: externalBookingEventIdentifier,
      },
    })
    if (isNil(travelDeskBookingEvent)) {
      throw new TravelDeskInvoiceValidationError("The selected booking event was not found.")
    }

    if (isEmpty(travelDeskBookingEvent.airReservationSegments)) {
      throw new TravelDeskInvoiceValidationError(
        "The selected booking event has no flight segments. Choose a different booking event."
      )
    }

    return travelDeskBookingEvent
  }
}

export default CreateService
