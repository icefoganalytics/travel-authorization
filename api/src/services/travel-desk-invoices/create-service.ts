import { type CreationAttributes, Op } from "@sequelize/core"
import { isEmpty, isNil, keyBy } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"
import TravelDeskBookingEvent from "@/models/travel-desk-booking-event"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import TravelDeskInvoiceValidationError from "@/services/travel-desk-invoices/invoice-validation-error"
import {
  BulkCreateService,
  ValidateLinkedFlightSegmentsService,
} from "@/services/travel-desk-invoice-items"
import {
  ValidateItemsService,
  type TravelDeskInvoiceItemAttributes,
} from "@/services/travel-desk-invoices/validate-items-service"

export type TravelDeskInvoiceCreationAttributes = Partial<
  Omit<CreationAttributes<TravelDeskInvoice>, "bookingReference"> & {
    sourceServiceFeeEventExternalIdentifiers: number[]
    items: TravelDeskInvoiceItemAttributes[]
  }
>

export class CreateService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected attributes: TravelDeskInvoiceCreationAttributes
  ) {
    super()
  }

  async perform(): Promise<TravelDeskInvoice> {
    const {
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode,
      items,
    } = this.attributes
    if (isNil(externalBookingEventIdentifier)) {
      throw new TravelDeskInvoiceValidationError("Booking event is required.")
    }

    if (!Array.isArray(sourceServiceFeeEventExternalIdentifiers)) {
      throw new TravelDeskInvoiceValidationError("Service fee events must be an array.")
    }

    if (isNil(currencyCode)) {
      throw new TravelDeskInvoiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(items)) {
      throw new TravelDeskInvoiceValidationError("Invoice items must be an array.")
    }

    const travelDeskBookingEvent = await this.loadTravelDeskBookingEvent(externalBookingEventIdentifier)
    const { bookingReference } = travelDeskBookingEvent
    if (isNil(bookingReference)) {
      throw new TravelDeskInvoiceValidationError("The selected booking event has no booking reference.")
    }

    await this.assertSelectedServiceFeesAreValid(
      bookingReference,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode
    )
    const grossAmount = CalculateTotalService.perform(items)

    return db.transaction(async () => {
      const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(this.travelDeskTravelRequest.id)
      if (isNil(travelDeskTravelRequest)) {
        throw new TravelDeskInvoiceValidationError("Travel desk travel request does not exist.")
      }

      ValidateItemsService.perform(
        items,
        travelDeskBookingEvent.airReservationSegments.map((segment) => segment.airSegmentNumber),
        sourceServiceFeeEventExternalIdentifiers
      )
      await ValidateLinkedFlightSegmentsService.perform(items, this.travelDeskTravelRequest.id)

      const invoice = await TravelDeskInvoice.create({
        travelDeskTravelRequestId: this.travelDeskTravelRequest.id,
        bookingReference,
        externalBookingEventIdentifier,
        currencyCode,
        invoiceNumber: this.attributes.invoiceNumber,
        invoiceDate: this.attributes.invoiceDate,
        warrantNumber: this.attributes.warrantNumber,
        clientNumber: this.attributes.clientNumber,
        clientName: this.attributes.clientName,
        department: this.attributes.department,
        mailcode: this.attributes.mailcode,
        iataNumber: this.attributes.iataNumber,
        bookingAgentName: this.attributes.bookingAgentName,
        ticketingAgentName: this.attributes.ticketingAgentName,
        bookingDate: this.attributes.bookingDate,
        grossAmount,
      })
      await BulkCreateService.perform(invoice.id, items)

      return invoice.reload({
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

  private async assertSelectedServiceFeesAreValid(
    bookingReference: string,
    sourceServiceFeeEventExternalIdentifiers: number[],
    currencyCode: string
  ): Promise<void> {
    if (isEmpty(sourceServiceFeeEventExternalIdentifiers)) return

    const serviceFeeTravelDeskBookingEvents = await TravelDeskBookingEvent.findAll({
      attributes: ["externalTravelPortIdentifier", "serviceFeeTransaction"],
      where: {
        bookingReference,
        externalTravelPortIdentifier: {
          [Op.in]: sourceServiceFeeEventExternalIdentifiers,
        },
      },
    })
    const serviceFeeTravelDeskBookingEventsByExternalTravelPortIdentifier = keyBy(
      serviceFeeTravelDeskBookingEvents,
      "externalTravelPortIdentifier"
    )
    const serviceFeeDocumentNumbers = new Set<string>()
    for (const sourceServiceFeeEventExternalIdentifier of sourceServiceFeeEventExternalIdentifiers) {
      const serviceFeeTravelDeskBookingEvent =
        serviceFeeTravelDeskBookingEventsByExternalTravelPortIdentifier[sourceServiceFeeEventExternalIdentifier]
      const serviceFeeTransaction = serviceFeeTravelDeskBookingEvent?.serviceFeeTransaction
      if (isNil(serviceFeeTransaction)) {
        throw new TravelDeskInvoiceValidationError(
          "Every selected service fee must belong to this booking reference."
        )
      }

      if (!isNil(serviceFeeTransaction.currencyCode) && serviceFeeTransaction.currencyCode !== currencyCode) {
        throw new TravelDeskInvoiceValidationError(
          "Selected service fee currency must match the invoice currency."
        )
      }

      const { serviceFeeDocumentNumber } = serviceFeeTransaction
      if (isNil(serviceFeeDocumentNumber) || isEmpty(serviceFeeDocumentNumber)) continue

      if (serviceFeeDocumentNumbers.has(serviceFeeDocumentNumber)) {
        throw new TravelDeskInvoiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }
      serviceFeeDocumentNumbers.add(serviceFeeDocumentNumber)
    }
  }
}

export default CreateService
