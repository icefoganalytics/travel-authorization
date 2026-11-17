import { Op } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"
import TravelDeskBookingEvent from "@/models/travel-desk-booking-event"
import { type InvoiceSourceSnapshot } from "@/models/travel-desk-invoice"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import {
  createInvoiceItems,
  validateLinkedFlightSegments,
} from "@/services/travel-desk-invoices/invoice-items"
import {
  type InvoiceItemAttributes,
  validateInvoiceItems,
} from "@/services/travel-desk-invoices/validate-items"

import { IndexSerializer } from "@/serializers/travel-desk-booking-events"

export type InvoiceHeaderAttributes = {
  bookingReference: string
  externalBookingEventIdentifier: number
  sourceServiceFeeEventExternalIdentifiers: number[]
  currencyCode: string
  invoiceNumber?: string | null
  invoiceDate?: string | null
  warrantNumber?: string | null
  clientNumber?: string | null
  clientName?: string | null
  department?: string | null
  mailcode?: string | null
  iataNumber?: string | null
  bookingAgentName?: string | null
  ticketingAgentName?: string | null
  bookingDate?: string | null
  items: InvoiceItemAttributes[]
}

export class CreateService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected attributes: Partial<InvoiceHeaderAttributes>
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

    const snapshot = await this.loadSourceSnapshot(
      normalizedBookingReference,
      externalBookingEventIdentifier,
      sourceServiceFeeEventExternalIdentifiers
    )
    const grossAmount = CalculateTotalService.perform(items)

    return db.transaction(async () => {
      await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)
      await validateInvoiceItems(
        items,
        snapshot,
        sourceServiceFeeEventExternalIdentifiers,
        currencyCode
      )
      await validateLinkedFlightSegments(items, this.travelDeskTravelRequest.id)

      const invoice = await TravelDeskInvoice.create({
        travelDeskTravelRequestId: this.travelDeskTravelRequest.id,
        bookingReference: normalizedBookingReference,
        externalBookingEventIdentifier,
        sourceSnapshot: snapshot,
        currencyCode,
        invoiceNumber: this.attributes.invoiceNumber ?? null,
        invoiceDate: this.attributes.invoiceDate ?? null,
        warrantNumber: this.attributes.warrantNumber ?? null,
        clientNumber: this.attributes.clientNumber ?? null,
        clientName: this.attributes.clientName ?? null,
        department: this.attributes.department ?? null,
        mailcode: this.attributes.mailcode ?? null,
        iataNumber: this.attributes.iataNumber ?? null,
        bookingAgentName: this.attributes.bookingAgentName ?? null,
        ticketingAgentName: this.attributes.ticketingAgentName ?? null,
        bookingDate: this.attributes.bookingDate ?? null,
        grossAmount,
      })
      await createInvoiceItems(invoice.id, items)

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

  private async loadSourceSnapshot(
    bookingReference: string,
    externalBookingEventIdentifier: number,
    sourceServiceFeeEventExternalIdentifiers: number[]
  ): Promise<InvoiceSourceSnapshot> {
    const bookingEvents = await TravelDeskBookingEvent.findAll({
      where: {
        bookingReference,
        externalTravelPortIdentifier: {
          [Op.in]: [externalBookingEventIdentifier, ...sourceServiceFeeEventExternalIdentifiers],
        },
      },
    })
    const sourceEvents = IndexSerializer.perform(bookingEvents)
    const bookingEvent = sourceEvents.find(
      (event) => event.travelOrderIdentifier === externalBookingEventIdentifier
    )
    if (isNil(bookingEvent) || bookingEvent.airReservationSegments.length === 0) {
      throw new InvoiceValidationError(
        "Choose a booking event with flight segments for this booking reference."
      )
    }

    if (bookingEvent.bookingReference?.trim().toUpperCase() !== bookingReference) {
      throw new InvoiceValidationError("Booking event does not belong to this booking reference.")
    }

    const serviceFeeEvents = sourceServiceFeeEventExternalIdentifiers.map((eventId) => {
      const event = sourceEvents.find((sourceEvent) => sourceEvent.travelOrderIdentifier === eventId)
      if (
        isNil(event) ||
        isNil(event.serviceFeeTransaction) ||
        event.bookingReference?.trim().toUpperCase() !== bookingReference
      ) {
        throw new InvoiceValidationError(
          "Every selected service fee must belong to this booking reference."
        )
      }

      return event
    })

    return {
      bookingEvent,
      serviceFeeEvents,
    }
  }
}

export default CreateService
