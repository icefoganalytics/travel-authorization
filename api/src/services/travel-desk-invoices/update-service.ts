import { isEmpty, isNil } from "lodash"

import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { type TravelDeskInvoiceCreationAttributes } from "@/services/travel-desk-invoices/create-service"
import {
  BulkCreateService,
  ValidateLinkedFlightSegmentsService,
} from "@/services/travel-desk-invoice-items"
import { ValidateItemsService } from "@/services/travel-desk-invoices/validate-items-service"
import { withInvoiceLock } from "@/services/travel-desk-invoices/with-invoice-lock"

export type InvoiceUpdateAttributes = Omit<
  TravelDeskInvoiceCreationAttributes,
  "bookingReference" | "externalBookingEventIdentifier" | "sourceServiceFeeEventExternalIdentifiers"
>

export class UpdateService extends BaseService {
  constructor(
    protected invoice: TravelDeskInvoice,
    protected attributes: InvoiceUpdateAttributes
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

    const grossAmount = CalculateTotalService.perform(items)

    return withInvoiceLock(this.invoice.id, async (invoice, transaction) => {
      const savedItems = await TravelDeskInvoiceItem.findAll({
        where: { travelDeskInvoiceId: invoice.id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      })
      const sourceAirSegmentNumbers: number[] = []
      const serviceFeeEventIds: number[] = []
      for (const item of savedItems) {
        if (!isNil(item.sourceAirSegmentNumber)) {
          sourceAirSegmentNumbers.push(item.sourceAirSegmentNumber)
        }

        if (!isNil(item.sourceServiceFeeEventExternalIdentifier)) {
          serviceFeeEventIds.push(item.sourceServiceFeeEventExternalIdentifier)
        }
      }

      if (!isEmpty(serviceFeeEventIds) && currencyCode !== invoice.currencyCode) {
        throw new InvoiceValidationError("Invoice currency cannot be changed for saved service fees.")
      }

      ValidateItemsService.perform(items, sourceAirSegmentNumbers, serviceFeeEventIds)
      await ValidateLinkedFlightSegmentsService.perform(items, invoice.travelDeskTravelRequestId)

      await invoice.update({
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
        where: { travelDeskInvoiceId: invoice.id },
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
}

export default UpdateService
