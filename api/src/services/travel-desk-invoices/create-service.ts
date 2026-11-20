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
  CreationAttributes<TravelDeskInvoice> & {
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
      bookingReference,
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode,
      items,
    } = this.attributes
    if (isNil(bookingReference)) {
      throw new InvoiceValidationError("Booking reference is required.")
    }

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

    const normalizedBookingReference = bookingReference.trim().toUpperCase()
    this.assertBookingReferenceIsValid(normalizedBookingReference)

    await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)

    const bookingEvent = await this.loadSelectedBookingEvent(
      normalizedBookingReference,
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers,
      currencyCode
    )
    const grossAmount = CalculateTotalService.perform(items)

    return db.transaction(async () => {
      await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)
      ValidateItemsService.perform(
        items,
        bookingEvent.airReservationSegments.map((segment) => segment.airSegmentNumber),
        sourceServiceFeeEventExternalIdentifiers
      )
      await ValidateLinkedFlightSegmentsService.perform(items, this.travelDeskTravelRequest.id)

      const invoice = await TravelDeskInvoice.create({
        travelDeskTravelRequestId: this.travelDeskTravelRequest.id,
        bookingReference: normalizedBookingReference,
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

  private assertBookingReferenceIsValid(bookingReference: string): void {
    if (!/^[A-Z0-9]{6}$/.test(bookingReference)) {
      throw new InvoiceValidationError("Booking reference must contain six letters or numbers.")
    }
  }

  private async requireActiveTravelRequest(travelDeskTravelRequestId: number): Promise<void> {
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId)
    if (isNil(travelDeskTravelRequest)) {
      throw new InvoiceValidationError("Travel desk travel request does not exist.")
    }
  }

  private async loadSelectedBookingEvent(
    bookingReference: string,
    externalBookingEventIdentifier: number,
    sourceServiceFeeEventExternalIdentifiers: number[],
    currencyCode: string
  ): Promise<TravelDeskBookingEvent> {
    const bookingEvents = await TravelDeskBookingEvent.findAll({
      where: {
        bookingReference,
        externalTravelPortIdentifier: {
          [Op.in]: [externalBookingEventIdentifier, ...sourceServiceFeeEventExternalIdentifiers],
        },
      },
    })
    const bookingEventsByIdentifier = keyBy(bookingEvents, "externalTravelPortIdentifier")
    const bookingEvent = bookingEventsByIdentifier[externalBookingEventIdentifier]
    if (isNil(bookingEvent) || isEmpty(bookingEvent.airReservationSegments)) {
      throw new InvoiceValidationError(
        "Choose a booking event with flight segments for this booking reference."
      )
    }

    const documentNumbers = new Set<string>()
    for (const eventId of sourceServiceFeeEventExternalIdentifiers) {
      const fee = bookingEventsByIdentifier[eventId]?.serviceFeeTransaction
      if (isNil(fee)) {
        throw new InvoiceValidationError(
          "Every selected service fee must belong to this booking reference."
        )
      }

      if (!isNil(fee.currencyCode) && fee.currencyCode !== currencyCode) {
        throw new InvoiceValidationError(
          "Selected service fee currency must match the invoice currency."
        )
      }

      const documentNumber = fee.serviceFeeDocumentNumber
      if (isNil(documentNumber) || isEmpty(documentNumber)) continue

      if (documentNumbers.has(documentNumber)) {
        throw new InvoiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }
      documentNumbers.add(documentNumber)
    }

    return bookingEvent
  }
}

export default CreateService
