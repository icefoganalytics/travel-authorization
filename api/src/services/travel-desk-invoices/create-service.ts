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

    await this.requireActiveTravelRequest(this.travelDeskTravelRequest.id)

    const travelDeskBookingEvent = await this.loadTravelDeskBookingEvent(
      bookingReference,
      externalBookingEventIdentifier
    )
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
    bookingReference: string,
    externalBookingEventIdentifier: number
  ): Promise<TravelDeskBookingEvent> {
    const travelDeskBookingEvent = await TravelDeskBookingEvent.findOne({
      where: {
        bookingReference,
        externalTravelPortIdentifier: externalBookingEventIdentifier,
      },
    })
    if (isNil(travelDeskBookingEvent) || isEmpty(travelDeskBookingEvent.airReservationSegments)) {
      throw new InvoiceValidationError(
        "Choose a booking event with flight segments for this booking reference."
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
        externalTravelPortIdentifier: { [Op.in]: sourceServiceFeeEventExternalIdentifiers },
      },
    })
    const serviceFeeTravelDeskBookingEventsByIdentifier = keyBy(
      serviceFeeTravelDeskBookingEvents,
      "externalTravelPortIdentifier"
    )
    const documentNumbers = new Set<string>()
    for (const eventId of sourceServiceFeeEventExternalIdentifiers) {
      const fee = serviceFeeTravelDeskBookingEventsByIdentifier[eventId]?.serviceFeeTransaction
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
  }
}

export default CreateService
