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
  recordLocator: string
  sourceBookingEventId: number
  sourceServiceFeeEventIds: number[]
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
    const { recordLocator, sourceBookingEventId, sourceServiceFeeEventIds, currencyCode, items } =
      this.attributes
    if (isNil(recordLocator)) {
      throw new InvoiceValidationError("Record locator is required.")
    }

    if (isNil(sourceBookingEventId)) {
      throw new InvoiceValidationError("Booking event is required.")
    }

    if (!Array.isArray(sourceServiceFeeEventIds)) {
      throw new InvoiceValidationError("Service fee events must be an array.")
    }

    if (isNil(currencyCode)) {
      throw new InvoiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(items)) {
      throw new InvoiceValidationError("Invoice items must be an array.")
    }

    const normalizedRecordLocator = recordLocator.trim().toUpperCase()
    this.assertRecordLocatorIsValid(normalizedRecordLocator)

    await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)

    const snapshot = await this.loadSourceSnapshot(
      normalizedRecordLocator,
      sourceBookingEventId,
      sourceServiceFeeEventIds
    )
    const grossAmount = CalculateTotalService.perform(items)

    return db.transaction(async () => {
      await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)
      await validateInvoiceItems(items, snapshot, sourceServiceFeeEventIds, currencyCode)
      await validateLinkedFlightSegments(items, this.travelDeskTravelRequest.id)

      const invoice = await TravelDeskInvoice.create({
        travelDeskTravelRequestId: this.travelDeskTravelRequest.id,
        recordLocator: normalizedRecordLocator,
        sourceBookingEventId,
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
            include: ["productType"],
          },
        ],
      })
    })
  }

  private assertRecordLocatorIsValid(recordLocator: string): void {
    if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }
  }

  private async requireActiveTravelRequest(travelDeskTravelRequestId: number): Promise<void> {
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId)
    if (isNil(travelDeskTravelRequest)) {
      throw new InvoiceValidationError("Travel desk travel request does not exist.")
    }
  }

  private async loadSourceSnapshot(
    recordLocator: string,
    sourceBookingEventId: number,
    sourceServiceFeeEventIds: number[]
  ): Promise<InvoiceSourceSnapshot> {
    const bookingEvents = await TravelDeskBookingEvent.findAll({
      where: {
        recordLocator,
        externalTravelPortIdentifier: {
          [Op.in]: [sourceBookingEventId, ...sourceServiceFeeEventIds],
        },
      },
    })
    const sourceEvents = IndexSerializer.perform(bookingEvents)
    const bookingEvent = sourceEvents.find(
      (event) => event.travelOrderIdentifier === sourceBookingEventId
    )
    if (isNil(bookingEvent) || bookingEvent.airReservationSegments.length === 0) {
      throw new InvoiceValidationError("Choose a booking event with flight segments for this locator.")
    }

    if (bookingEvent.recordLocator?.trim().toUpperCase() !== recordLocator) {
      throw new InvoiceValidationError("Booking event does not belong to this record locator.")
    }

    const serviceFeeEvents = sourceServiceFeeEventIds.map((eventId) => {
      const event = sourceEvents.find((sourceEvent) => sourceEvent.travelOrderIdentifier === eventId)
      if (
        isNil(event) ||
        isNil(event.serviceFeeTransaction) ||
        event.recordLocator?.trim().toUpperCase() !== recordLocator
      ) {
        throw new InvoiceValidationError("Every selected service fee must belong to this locator.")
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
