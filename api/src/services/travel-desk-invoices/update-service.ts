import { type Transaction } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import { TravelDeskInvoiceItems, TravelDeskInvoices } from "@/services"
import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

import { type TravelDeskInvoiceCreationAttributes } from "@/services/travel-desk-invoices/create-service"
import { type TravelDeskInvoiceItemAttributes } from "@/services/travel-desk-invoice-items/validate-travel-desk-invoice-items-service"
import { withTravelDeskInvoiceLock } from "@/services/travel-desk-invoices/with-travel-desk-invoice-lock"

export type TravelDeskInvoiceUpdateAttributes = Omit<
  TravelDeskInvoiceCreationAttributes,
  "bookingReference" | "externalBookingEventIdentifier"
>

export class UpdateService extends BaseService {
  constructor(
    protected travelDeskInvoice: TravelDeskInvoice,
    protected travelDeskInvoiceUpdateAttributes: TravelDeskInvoiceUpdateAttributes
  ) {
    super()
  }

  async perform(): Promise<TravelDeskInvoice> {
    const { currencyCode, itemsAttributes: travelDeskInvoiceItemsAttributes } =
      this.travelDeskInvoiceUpdateAttributes
    if (isNil(currencyCode)) {
      throw new ServiceValidationError("Currency code is required.")
    }

    if (!Array.isArray(travelDeskInvoiceItemsAttributes)) {
      throw new ServiceValidationError("Invoice items must be an array.")
    }

    return withTravelDeskInvoiceLock(
      this.travelDeskInvoice.id,
      async (travelDeskInvoice, transaction) => {
        const { id: travelDeskInvoiceId } = travelDeskInvoice
        await this.validateItemsAgainstSavedInvoice(
          travelDeskInvoice,
          currencyCode,
          travelDeskInvoiceItemsAttributes,
          transaction
        )
        const grossAmount = TravelDeskInvoices.CalculateTotalService.perform(
          travelDeskInvoiceItemsAttributes
        )

        await travelDeskInvoice.update({
          currencyCode,
          invoiceNumber: this.travelDeskInvoiceUpdateAttributes.invoiceNumber,
          invoiceDate: this.travelDeskInvoiceUpdateAttributes.invoiceDate,
          warrantNumber: this.travelDeskInvoiceUpdateAttributes.warrantNumber,
          clientNumber: this.travelDeskInvoiceUpdateAttributes.clientNumber,
          clientName: this.travelDeskInvoiceUpdateAttributes.clientName,
          department: this.travelDeskInvoiceUpdateAttributes.department,
          mailcode: this.travelDeskInvoiceUpdateAttributes.mailcode,
          iataNumber: this.travelDeskInvoiceUpdateAttributes.iataNumber,
          bookingAgentName: this.travelDeskInvoiceUpdateAttributes.bookingAgentName,
          ticketingAgentName: this.travelDeskInvoiceUpdateAttributes.ticketingAgentName,
          bookingDate: this.travelDeskInvoiceUpdateAttributes.bookingDate,
          grossAmount,
        })
        await TravelDeskInvoiceItem.destroy({
          where: {
            travelDeskInvoiceId,
          },
        })
        await TravelDeskInvoiceItems.BulkCreateService.perform(
          travelDeskInvoice,
          travelDeskInvoiceItemsAttributes
        )

        return travelDeskInvoice.reload({
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
      }
    )
  }

  private async validateItemsAgainstSavedInvoice(
    travelDeskInvoice: TravelDeskInvoice,
    currencyCode: string,
    travelDeskInvoiceItemsAttributes: TravelDeskInvoiceItemAttributes[],
    transaction: Transaction
  ): Promise<void> {
    const savedTravelDeskInvoiceItems = await TravelDeskInvoiceItem.findAll({
      where: {
        travelDeskInvoiceId: travelDeskInvoice.id,
      },
      lock: transaction.LOCK.UPDATE,
      transaction,
    })
    const sourceAirSegmentNumbers: number[] = []
    const sourceServiceFeeEventExternalIdentifiers: number[] = []
    for (const travelDeskInvoiceItem of savedTravelDeskInvoiceItems) {
      if (!isNil(travelDeskInvoiceItem.sourceAirSegmentNumber)) {
        sourceAirSegmentNumbers.push(travelDeskInvoiceItem.sourceAirSegmentNumber)
      }

      if (!isNil(travelDeskInvoiceItem.sourceServiceFeeEventExternalIdentifier)) {
        sourceServiceFeeEventExternalIdentifiers.push(
          travelDeskInvoiceItem.sourceServiceFeeEventExternalIdentifier
        )
      }
    }

    if (
      !isEmpty(sourceServiceFeeEventExternalIdentifiers) &&
      currencyCode !== travelDeskInvoice.currencyCode
    ) {
      throw new ServiceValidationError(
        "Invoice currency cannot be changed for saved service fees."
      )
    }

    TravelDeskInvoiceItems.ValidateTravelDeskInvoiceItemsService.perform(
      travelDeskInvoiceItemsAttributes,
      sourceAirSegmentNumbers,
      sourceServiceFeeEventExternalIdentifiers
    )
  }
}

export default UpdateService
