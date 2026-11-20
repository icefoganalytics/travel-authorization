import { type CreationAttributes, Op } from "@sequelize/core"
import { isEmpty, isNil, keyBy } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"
import TravelDeskBookingEvent from "@/models/travel-desk-booking-event"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
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
      throw new InvoiceValidationError("Booking event is required.")
    }

    if (!Array.isArray(sourceServiceFeeEventExternalIdentifiers)) {
      throw new InvoiceValidationError("Service fee events must be an array.")
    }

    if (isNil(currencyCode)) {
      throw new InvoiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(items)) {
      throw new InvoiceValidationError("Invoice items must be an array.")
    }

    await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)

    const travelDeskBookingEvent = await this.loadTravelDeskBookingEvent(externalBookingEventIdentifier)
    const { bookingReference } = travelDeskBookingEvent
    if (isNil(bookingReference)) {
      throw new InvoiceValidationError("The selected booking event has no booking reference.")
    }

    await this.validateSelectedServiceFees(
      bookingReference,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode
    )
    const grossAmount = CalculateTotalService.perform(items)

    return db.transaction(async () => {
      await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)
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

  private async requireActiveTravelRequest(travelDeskTravelRequestId: number): Promise<void> {
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId)
    if (isNil(travelDeskTravelRequest)) {
      throw new InvoiceValidationError("Travel desk travel request does not exist.")
    }
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
      throw new InvoiceValidationError("The selected booking event was not found.")
    }

    if (isEmpty(travelDeskBookingEvent.airReservationSegments)) {
      throw new InvoiceValidationError(
        "The selected booking event has no flight segments. Choose a different booking event."
      )
    }

    return travelDeskBookingEvent
  }

  private async validateSelectedServiceFees(
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
        throw new InvoiceValidationError(
          "Every selected service fee must belong to this booking reference."
        )
      }

      if (!isNil(serviceFeeTransaction.currencyCode) && serviceFeeTransaction.currencyCode !== currencyCode) {
        throw new InvoiceValidationError(
          "Selected service fee currency must match the invoice currency."
        )
      }

      const { serviceFeeDocumentNumber } = serviceFeeTransaction
      if (isNil(serviceFeeDocumentNumber) || isEmpty(serviceFeeDocumentNumber)) continue

      if (serviceFeeDocumentNumbers.has(serviceFeeDocumentNumber)) {
        throw new InvoiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }
      serviceFeeDocumentNumbers.add(serviceFeeDocumentNumber)
    }
  }
}

export default CreateService
