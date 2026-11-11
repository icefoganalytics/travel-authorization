import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { type InvoiceHeaderAttributes } from "@/services/travel-desk-invoices/create-service"
import {
  createInvoiceItems,
  validateLinkedFlightSegments,
} from "@/services/travel-desk-invoices/invoice-items"
import { validateInvoiceItems } from "@/services/travel-desk-invoices/validate-items"

export type InvoiceUpdateAttributes = Omit<
  InvoiceHeaderAttributes,
  "recordLocator" | "sourceBookingEventId" | "sourceServiceFeeEventIds"
>

export class UpdateService extends BaseService {
  constructor(
    protected invoice: TravelDeskInvoice,
    protected attributes: Partial<InvoiceUpdateAttributes>
  ) {
    super()
  }

  async perform(): Promise<TravelDeskInvoice> {
    const { currencyCode, items } = this.attributes
    if (isNil(currencyCode)) {
      throw new InvoiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(items)) {
      throw new InvoiceValidationError("Invoice items must be an array.")
    }

    const snapshot = this.invoice.sourceSnapshot
    const serviceFeeEventIds = snapshot.serviceFeeEvents.map((event) => event.travelOrderIdentifier)
    const grossAmount = CalculateTotalService.perform(items)

    return db.transaction(async () => {
      await validateInvoiceItems(items, snapshot, serviceFeeEventIds, currencyCode)
      await validateLinkedFlightSegments(items, this.invoice.travelDeskTravelRequestId)

      await this.invoice.update({
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
      await TravelDeskInvoiceItem.destroy({
        where: { travelDeskInvoiceId: this.invoice.id },
      })
      await createInvoiceItems(this.invoice.id, items)

      return this.invoice.reload({
        include: [
          {
            association: "items",
            include: ["productType"],
          },
        ],
      })
    })
  }
}

export default UpdateService
