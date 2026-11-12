import { TravelDeskTravelRequest } from "@/models"
import { BookingsService } from "@/integrations/travel-port-integration/services/bookings-service"
import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export class LinkTravelPortBookingService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected recordLocator: unknown
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    if (this.recordLocator === null) {
      return this.travelDeskTravelRequest.update({ travelPortRecordLocator: null })
    }

    if (typeof this.recordLocator !== "string") {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }

    const recordLocator = this.recordLocator.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }

    const { travelPortBookings } = await BookingsService.perform(recordLocator, 1, 0)
    if (travelPortBookings.length === 0) {
      throw new InvoiceValidationError(
        "TravelPort booking no longer exists. Choose another booking."
      )
    }

    return this.travelDeskTravelRequest.update({ travelPortRecordLocator: recordLocator })
  }
}

export default LinkTravelPortBookingService
