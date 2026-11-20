import { Op } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { TravelDeskBookingEvent } from "@/models"

import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

export class ValidateTravelDeskInvoiceServiceFeeSelectionService extends BaseService {
  constructor(
    protected bookingReference: string,
    protected sourceServiceFeeEventExternalIdentifiers: ReadonlySet<number>,
    protected currencyCode: string
  ) {
    super()
  }

  async perform(): Promise<void> {
    if (this.sourceServiceFeeEventExternalIdentifiers.size === 0) {
      return
    }

    const selectedTravelDeskBookingEvents = await TravelDeskBookingEvent.findAll({
      attributes: ["serviceFeeTransaction"],
      where: {
        bookingReference: this.bookingReference,
        externalTravelPortIdentifier: {
          [Op.in]: [...this.sourceServiceFeeEventExternalIdentifiers],
        },
      },
    })
    if (
      selectedTravelDeskBookingEvents.length !== this.sourceServiceFeeEventExternalIdentifiers.size
    ) {
      throw new ServiceValidationError(
        "Every selected service fee must belong to this booking reference."
      )
    }

    const serviceFeeDocumentNumbers = new Set<string>()
    for (const { serviceFeeTransaction } of selectedTravelDeskBookingEvents) {
      if (isNil(serviceFeeTransaction)) {
        throw new ServiceValidationError("The selected booking event has no service fee.")
      }

      const { currencyCode, serviceFeeDocumentNumber } = serviceFeeTransaction
      if (!isNil(currencyCode) && currencyCode !== this.currencyCode) {
        throw new ServiceValidationError(
          "Selected service fee currency must match the invoice currency."
        )
      }

      if (isNil(serviceFeeDocumentNumber) || isEmpty(serviceFeeDocumentNumber)) continue

      if (serviceFeeDocumentNumbers.has(serviceFeeDocumentNumber)) {
        throw new ServiceValidationError(
          "Multiple versions of a service fee document cannot be selected."
        )
      }
      serviceFeeDocumentNumbers.add(serviceFeeDocumentNumber)
    }
  }
}

export default ValidateTravelDeskInvoiceServiceFeeSelectionService
