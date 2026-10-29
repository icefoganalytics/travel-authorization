import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"
import { TravelDeskInvoicesPolicy } from "@/policies/travel-desk-invoices-policy"
import {
  SaveService,
  type InvoiceHeaderAttributes,
  type InvoiceUpdateAttributes,
} from "@/services/travel-desk-invoices/save-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/amounts"
import { SourceUnavailableError } from "@/services/travel-desk-invoices/source-service"
import { ShowSerializer } from "@/serializers/travel-desk-invoices"
import BaseController from "@/controllers/base-controller"

export class TravelDeskInvoicesController extends BaseController<TravelDeskInvoice> {
  async index() {
    if (!this.isTravelDeskStaff()) return this.forbidden()

    const requestFilter = this.query.where
    if (
      isNil(requestFilter) ||
      typeof requestFilter !== "object" ||
      !("travelDeskTravelRequestId" in requestFilter)
    ) {
      return this.response
        .status(422)
        .json({ message: "Travel desk travel request filter is required." })
    }

    const where = this.buildWhere()

    try {
      const scopedTravelDeskInvoices = TravelDeskInvoicesPolicy.applyScope([], this.currentUser)
      const totalCount = await scopedTravelDeskInvoices.count({ where })
      const travelDeskInvoices = await scopedTravelDeskInvoices.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order: this.buildOrder([["createdAt", "DESC"]]),
        include: [{ association: "items", include: ["productType"] }],
      })

      return this.response.status(200).json({
        travelDeskInvoices: travelDeskInvoices.map(ShowSerializer.perform),
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to index travel desk invoices: ${error}`, { error })
      return this.response.status(500).json({ message: "Failed to load invoices." })
    }
  }

  async show() {
    if (!this.isTravelDeskStaff()) return this.forbidden()

    const invoice = await this.loadInvoice()
    if (isNil(invoice)) return this.notFound()

    return this.response.status(200).json({ travelDeskInvoice: ShowSerializer.perform(invoice) })
  }

  async create() {
    if (!this.isTravelDeskStaff()) return this.forbidden()

    let attributes: InvoiceHeaderAttributes
    try {
      attributes = parseCreateAttributes(this.request.body)
    } catch (error) {
      return this.validationFailure(
        error instanceof InvoiceValidationError ? error.message : undefined
      )
    }

    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(
      attributes.travelDeskTravelRequestId
    )
    if (isNil(travelDeskTravelRequest)) {
      return this.notFound("Travel desk travel request not found.")
    }

    try {
      const invoice = await SaveService.create(attributes)
      return this.response.status(201).json({ travelDeskInvoice: ShowSerializer.perform(invoice) })
    } catch (error) {
      return this.handleSaveError("create", error)
    }
  }

  async update() {
    if (!this.isTravelDeskStaff()) return this.forbidden()

    const invoice = await this.loadInvoice()
    if (isNil(invoice)) return this.notFound()

    let attributes: InvoiceUpdateAttributes
    try {
      attributes = parseUpdateAttributes(this.request.body)
    } catch (error) {
      return this.validationFailure(
        error instanceof InvoiceValidationError ? error.message : undefined
      )
    }

    try {
      const updatedInvoice = await SaveService.update(invoice, attributes)
      return this.response
        .status(200)
        .json({ travelDeskInvoice: ShowSerializer.perform(updatedInvoice) })
    } catch (error) {
      return this.handleSaveError("update", error)
    }
  }

  async destroy() {
    if (!this.isTravelDeskStaff()) return this.forbidden()

    const invoice = await this.loadInvoice()
    if (isNil(invoice)) return this.notFound()

    try {
      await SaveService.destroy(invoice)
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Failed to destroy travel desk invoice: ${error}`, { error })
      return this.response.status(422).json({ message: "Invoice could not be deleted." })
    }
  }

  private async loadInvoice(): Promise<TravelDeskInvoice | null> {
    return TravelDeskInvoice.findByPk(this.params.travelDeskInvoiceId, {
      include: [{ association: "items", include: ["productType"] }],
    })
  }

  private isTravelDeskStaff(): boolean {
    return TravelDeskInvoicesPolicy.isStaff(this.currentUser)
  }

  private forbidden() {
    return this.response.status(403).json({ message: "You are not authorized to manage invoices." })
  }

  private notFound(message = "Invoice not found.") {
    return this.response.status(404).json({ message })
  }

  private validationFailure(message = "Invoice details are invalid.") {
    return this.response.status(422).json({ message })
  }

  private handleSaveError(action: string, error: unknown) {
    if (error instanceof SourceUnavailableError) {
      return this.response.status(503).json({ message: "Booking source is unavailable." })
    }

    if (error instanceof InvoiceValidationError) {
      return this.validationFailure(error.message)
    }

    if (isSequelizeValidationError(error)) {
      return this.validationFailure()
    }
    logger.error(`Failed to ${action} travel desk invoice: ${error}`, { error })
    return this.response.status(500).json({ message: `Failed to ${action} invoice.` })
  }
}

function isSequelizeValidationError(error: unknown): boolean {
  return error instanceof Error && ["ValidationError", "UniqueConstraintError"].includes(error.name)
}

function parseCreateAttributes(body: unknown): InvoiceHeaderAttributes {
  if (!isRecord(body)) throw new InvoiceValidationError("Invoice body must be an object.")
  const parsedItems = parseItems(body.items)
  const requestId = parseInteger(body.travelDeskTravelRequestId)
  const bookingEventId = parseInteger(body.sourceBookingEventId)
  const feeEventIds = parseIntegerArray(body.sourceServiceFeeEventIds)
  const recordLocator = parseString(body.recordLocator)

  return {
    ...parseHeaderAttributes(body),
    travelDeskTravelRequestId: requestId,
    recordLocator,
    sourceBookingEventId: bookingEventId,
    sourceServiceFeeEventIds: feeEventIds,
    items: parsedItems,
  }
}

function parseUpdateAttributes(body: unknown): InvoiceUpdateAttributes {
  if (!isRecord(body)) throw new InvoiceValidationError("Invoice body must be an object.")

  return {
    ...parseHeaderAttributes(body),
    items: parseItems(body.items),
  }
}

function parseHeaderAttributes(body: Record<string, unknown>) {
  return {
    currencyCode: parseString(body.currencyCode),
    invoiceNumber: parseOptionalString(body.invoiceNumber),
    invoiceDate: parseOptionalString(body.invoiceDate),
    warrantNumber: parseOptionalString(body.warrantNumber),
    clientNumber: parseOptionalString(body.clientNumber),
    clientName: parseOptionalString(body.clientName),
    department: parseOptionalString(body.department),
    mailcode: parseOptionalString(body.mailcode),
    iataNumber: parseOptionalString(body.iataNumber),
    bookingAgentName: parseOptionalString(body.bookingAgentName),
    ticketingAgentName: parseOptionalString(body.ticketingAgentName),
    bookingDate: parseOptionalString(body.bookingDate),
  }
}

function parseItems(value: unknown): InvoiceHeaderAttributes["items"] {
  if (!Array.isArray(value)) throw new InvoiceValidationError("Invoice items must be an array.")

  return value.map((itemValue) => {
    if (!isRecord(itemValue)) throw new InvoiceValidationError("Invoice item must be an object.")

    return {
      travelDeskProductTypeId: parseInteger(itemValue.travelDeskProductTypeId),
      travelDeskFlightSegmentId: parseOptionalInteger(itemValue.travelDeskFlightSegmentId),
      sourceAirSegmentNumber: parseOptionalInteger(itemValue.sourceAirSegmentNumber),
      sourceServiceFeeEventId: parseOptionalInteger(itemValue.sourceServiceFeeEventId),
      passengerName: parseOptionalString(itemValue.passengerName),
      ticketNumber: parseOptionalString(itemValue.ticketNumber),
      vendor: parseOptionalString(itemValue.vendor),
      description: parseOptionalString(itemValue.description),
      saleType: parseSaleType(itemValue.saleType),
      grossAmount: parseString(itemValue.grossAmount),
      position: parseInteger(itemValue.position),
    }
  })
}

function parseSaleType(value: unknown): "Sale" | "Refund" | "Void" {
  if (value === "Sale" || value === "Refund" || value === "Void") return value

  throw new InvoiceValidationError("Sale type is invalid.")
}

function parseInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new InvoiceValidationError("An integer value is required.")
  }

  return value
}

function parseIntegerArray(value: unknown): number[] {
  if (!Array.isArray(value))
    throw new InvoiceValidationError("Service fee events must be an array.")

  return value.map(parseInteger)
}

function parseOptionalInteger(value: unknown): number | null | undefined {
  if (isNil(value)) return value
  return parseInteger(value)
}

function parseString(value: unknown): string {
  if (typeof value !== "string") throw new InvoiceValidationError("A text value is required.")

  return value
}

function parseOptionalString(value: unknown): string | null | undefined {
  if (isNil(value)) return value
  const parsedValue = parseString(value)
  if (parsedValue.length === 0) return null

  return parsedValue
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !isNil(value) && !Array.isArray(value)
}

export default TravelDeskInvoicesController
