import { Op } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import TravelDeskInvoiceValidationError from "@/services/travel-desk-invoices/invoice-validation-error"

export class ValidateTravelDeskInvoiceServiceFeeSelectionService extends BaseService {
  constructor(
    protected bookingReference: string,
    protected sourceServiceFeeEventExternalIdentifiers: number[],
    protected currencyCode: string
  ) {
    super()
  }

  async perform(): Promise<void> {
    if (isEmpty(this.sourceServiceFeeEventExternalIdentifiers)) return

    const selectedTravelDeskBookingEvents = await TravelDeskBookingEvent.findAll({
      attributes: ["serviceFeeTransaction"],
      where: {
        bookingReference: this.bookingReference,
        externalTravelPortIdentifier: {
          [Op.in]: this.sourceServiceFeeEventExternalIdentifiers,
        },
      },
    })
    if (selectedTravelDeskBookingEvents.length !== new Set(this.sourceServiceFeeEventExternalIdentifiers).size) {
      throw new TravelDeskInvoiceValidationError(
        "Every selected service fee must belong to this booking reference."
      )
    }

    const serviceFeeDocumentNumbers = new Set<string>()
    for (const { serviceFeeTransaction } of selectedTravelDeskBookingEvents) {
      if (isNil(serviceFeeTransaction)) {
        throw new TravelDeskInvoiceValidationError("The selected booking event has no service fee.")
      }

      const { currencyCode, serviceFeeDocumentNumber } = serviceFeeTransaction
      if (!isNil(currencyCode) && currencyCode !== this.currencyCode) {
        throw new TravelDeskInvoiceValidationError(
          "Selected service fee currency must match the invoice currency."
        )
      }

      if (isNil(serviceFeeDocumentNumber) || isEmpty(serviceFeeDocumentNumber)) continue

      if (serviceFeeDocumentNumbers.has(serviceFeeDocumentNumber)) {
        throw new TravelDeskInvoiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }
      serviceFeeDocumentNumbers.add(serviceFeeDocumentNumber)
    }
  }
}

export default ValidateTravelDeskInvoiceServiceFeeSelectionService
