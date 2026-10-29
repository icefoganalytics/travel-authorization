import { type CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskInvoice,
  TravelDeskInvoiceItem,
  TravelDeskTravelRequest,
} from "@/models"
import { type InvoiceSourceSnapshot } from "@/models/travel-desk-invoice"
import {
  normalizeRecordLocator,
  SourceService,
} from "@/services/travel-desk-invoices/source-service"
import {
  calculateInvoiceTotal,
  InvoiceValidationError,
} from "@/services/travel-desk-invoices/amounts"
import {
  type InvoiceItemAttributes,
  validateInvoiceItems,
} from "@/services/travel-desk-invoices/validate-items"

export type InvoiceHeaderAttributes = {
  travelDeskTravelRequestId: number
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

export type InvoiceUpdateAttributes = Omit<
  InvoiceHeaderAttributes,
  | "travelDeskTravelRequestId"
  | "recordLocator"
  | "sourceBookingEventId"
  | "sourceServiceFeeEventIds"
>

export class SaveService {
  static async create(attributes: InvoiceHeaderAttributes): Promise<TravelDeskInvoice> {
    const recordLocator = normalizeRecordLocator(attributes.recordLocator)
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(
      attributes.travelDeskTravelRequestId
    )

    if (isNil(travelDeskTravelRequest)) {
      throw new InvoiceValidationError("Travel desk travel request does not exist.")
    }

    const sourceEvents = await SourceService.perform(recordLocator)
    const bookingEvent = sourceEvents.find(
      (event) => event.travelOrderIdentifier === attributes.sourceBookingEventId
    )
    if (isNil(bookingEvent) || bookingEvent.airReservationSegments.length === 0) {
      throw new InvoiceValidationError(
        "Choose a booking event with flight segments for this locator."
      )
    }
    if (bookingEvent.recordLocator?.trim().toUpperCase() !== recordLocator) {
      throw new InvoiceValidationError("Booking event does not belong to this record locator.")
    }

    const feeEvents = attributes.sourceServiceFeeEventIds.map((eventId) => {
      const event = sourceEvents.find(
        (sourceEvent) => sourceEvent.travelOrderIdentifier === eventId
      )
      if (
        isNil(event) ||
        isNil(event.serviceFeeTransaction) ||
        event.recordLocator?.trim().toUpperCase() !== recordLocator
      ) {
        throw new InvoiceValidationError("Every selected service fee must belong to this locator.")
      }

      return event
    })
    const snapshot: InvoiceSourceSnapshot = {
      bookingEvent,
      serviceFeeEvents: feeEvents,
    }
    const grossAmount = calculateInvoiceTotal(attributes.items)

    return db.transaction(async () => {
      await requireActiveTravelRequest(attributes.travelDeskTravelRequestId)
      await validateInvoiceItems(
        attributes.items,
        snapshot,
        attributes.sourceServiceFeeEventIds,
        attributes.currencyCode
      )
      await validateLinkedFlightSegments(attributes.items, attributes.travelDeskTravelRequestId)

      const invoice = await TravelDeskInvoice.create({
        travelDeskTravelRequestId: attributes.travelDeskTravelRequestId,
        recordLocator,
        sourceBookingEventId: attributes.sourceBookingEventId,
        sourceSnapshot: snapshot,
        currencyCode: attributes.currencyCode,
        invoiceNumber: attributes.invoiceNumber ?? null,
        invoiceDate: attributes.invoiceDate ?? null,
        warrantNumber: attributes.warrantNumber ?? null,
        clientNumber: attributes.clientNumber ?? null,
        clientName: attributes.clientName ?? null,
        department: attributes.department ?? null,
        mailcode: attributes.mailcode ?? null,
        iataNumber: attributes.iataNumber ?? null,
        bookingAgentName: attributes.bookingAgentName ?? null,
        ticketingAgentName: attributes.ticketingAgentName ?? null,
        bookingDate: attributes.bookingDate ?? null,
        grossAmount,
      })
      await createItems(invoice.id, attributes.items)
      return loadInvoice(invoice.id)
    })
  }

  static async update(
    invoice: TravelDeskInvoice,
    attributes: InvoiceUpdateAttributes
  ): Promise<TravelDeskInvoice> {
    const snapshot = invoice.sourceSnapshot
    const serviceFeeEventIds = snapshot.serviceFeeEvents.map((event) => event.travelOrderIdentifier)
    const grossAmount = calculateInvoiceTotal(attributes.items)

    return db.transaction(async () => {
      await validateInvoiceItems(
        attributes.items,
        snapshot,
        serviceFeeEventIds,
        attributes.currencyCode
      )
      await validateLinkedFlightSegments(attributes.items, invoice.travelDeskTravelRequestId)
      await invoice.update({
        currencyCode: attributes.currencyCode,
        invoiceNumber: attributes.invoiceNumber,
        invoiceDate: attributes.invoiceDate,
        warrantNumber: attributes.warrantNumber,
        clientNumber: attributes.clientNumber,
        clientName: attributes.clientName,
        department: attributes.department,
        mailcode: attributes.mailcode,
        iataNumber: attributes.iataNumber,
        bookingAgentName: attributes.bookingAgentName,
        ticketingAgentName: attributes.ticketingAgentName,
        bookingDate: attributes.bookingDate,
        grossAmount,
      })
      await TravelDeskInvoiceItem.destroy({
        where: { travelDeskInvoiceId: invoice.id },
      })
      await createItems(invoice.id, attributes.items)

      return loadInvoice(invoice.id)
    })
  }
  static async destroy(invoice: TravelDeskInvoice): Promise<void> {
    await db.transaction(async () => {
      await TravelDeskInvoiceItem.destroy({
        where: { travelDeskInvoiceId: invoice.id },
      })
      await invoice.destroy()
    })
  }
}

async function requireActiveTravelRequest(travelDeskTravelRequestId: number): Promise<void> {
  const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId)
  if (isNil(travelDeskTravelRequest)) {
    throw new InvoiceValidationError("Travel desk travel request does not exist.")
  }
}

async function validateLinkedFlightSegments(
  items: InvoiceItemAttributes[],
  travelDeskTravelRequestId: number
): Promise<void> {
  const segmentIds = [
    ...new Set(
      items.flatMap((item) =>
        isNil(item.travelDeskFlightSegmentId) ? [] : [item.travelDeskFlightSegmentId]
      )
    ),
  ]
  if (segmentIds.length === 0) return

  const segments = await TravelDeskFlightSegment.findAll({
    where: { id: segmentIds, deletedAt: null },
    include: [
      {
        model: TravelDeskFlightOption,
        where: { deletedAt: null },
        include: [
          {
            model: TravelDeskFlightRequest,
            required: true,
            where: { travelRequestId: travelDeskTravelRequestId, deletedAt: null },
          },
        ],
      },
    ],
  })

  if (segments.length !== segmentIds.length) {
    throw new InvoiceValidationError("Linked flight segments must belong to this travel request.")
  }
}

async function createItems(invoiceId: number, items: InvoiceItemAttributes[]): Promise<void> {
  const itemAttributes: CreationAttributes<TravelDeskInvoiceItem>[] = items.map((item) => ({
    travelDeskInvoiceId: invoiceId,
    travelDeskProductTypeId: item.travelDeskProductTypeId,
    travelDeskFlightSegmentId: item.travelDeskFlightSegmentId ?? null,
    sourceAirSegmentNumber: item.sourceAirSegmentNumber ?? null,
    sourceServiceFeeEventId: item.sourceServiceFeeEventId ?? null,
    passengerName: item.passengerName ?? null,
    ticketNumber: item.ticketNumber ?? null,
    vendor: item.vendor ?? null,
    description: item.description ?? null,
    saleType: item.saleType,
    grossAmount: item.grossAmount,
    position: item.position,
  }))

  await TravelDeskInvoiceItem.bulkCreate(itemAttributes)
}

async function loadInvoice(invoiceId: number): Promise<TravelDeskInvoice> {
  return TravelDeskInvoice.findByPk(invoiceId, {
    include: [{ association: "items", include: ["productType"] }],
    rejectOnEmpty: true,
  })
}

export default SaveService
