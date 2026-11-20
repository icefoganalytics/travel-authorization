import { isEmpty, isNil } from "lodash"

import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import ServiceValidationError from "@/services/service-validation-error"
import { type TravelDeskInvoiceCreationAttributes } from "@/services/travel-desk-invoices/create-service"
import {
  BulkCreateService,
  ValidateLinkedTravelDeskFlightSegmentsService,
} from "@/services/travel-desk-invoice-items"
import { ValidateTravelDeskInvoiceItemsService } from "@/services/travel-desk-invoices/validate-travel-desk-invoice-items-service"
import { withTravelDeskInvoiceLock } from "@/services/travel-desk-invoices/with-travel-desk-invoice-lock"

export type TravelDeskInvoiceUpdateAttributes = Omit<
  TravelDeskInvoiceCreationAttributes,
  "bookingReference" | "externalBookingEventIdentifier" | "sourceServiceFeeEventExternalIdentifiers"
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
      throw new ServiceValidationError({
        field: "currencyCode",
        text: "Currency code is required.",
      })
    }

    if (!Array.isArray(travelDeskInvoiceItemsAttributes)) {
      throw new ServiceValidationError({
        field: "itemsAttributes",
        text: "Invoice items must be an array.",
      })
    }

    const grossAmount = CalculateTotalService.perform(travelDeskInvoiceItemsAttributes)

    return withTravelDeskInvoiceLock(
      this.travelDeskInvoice.id,
      async (travelDeskInvoice, transaction) => {
        const { id: travelDeskInvoiceId } = travelDeskInvoice
        const savedTravelDeskInvoiceItems = await TravelDeskInvoiceItem.findAll({
          where: {
            travelDeskInvoiceId,
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
          throw new ServiceValidationError({
            field: "currencyCode",
            text: "Invoice currency cannot be changed for saved service fees.",
          })
        }

        ValidateTravelDeskInvoiceItemsService.perform(
          travelDeskInvoiceItemsAttributes,
          sourceAirSegmentNumbers,
          sourceServiceFeeEventExternalIdentifiers
        )
        await ValidateLinkedTravelDeskFlightSegmentsService.perform(
          travelDeskInvoice.travelDeskTravelRequestId,
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
        await BulkCreateService.perform(travelDeskInvoiceId, travelDeskInvoiceItemsAttributes)

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
}

export default UpdateService
