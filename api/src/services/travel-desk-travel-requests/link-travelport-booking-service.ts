import { TravelDeskTravelRequest } from "@/models"
import { BookingsService } from "@/integrations/travelport-integration/services/bookings-service"
import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export class LinkTravelportBookingService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected recordLocator: unknown
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    if (this.recordLocator === null) {
      return this.travelDeskTravelRequest.update({ travelportRecordLocator: null })
    }

    if (typeof this.recordLocator !== "string") {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }

    const recordLocator = this.recordLocator.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(recordLocator)) {
      throw new InvoiceValidationError("Record locator must contain six letters or numbers.")
    }

    const { travelportBookings } = await BookingsService.perform(recordLocator, 1, 0)
    if (travelportBookings.length === 0) {
      throw new InvoiceValidationError(
        "Travelport booking no longer exists. Choose another booking."
      )
    }

    return this.travelDeskTravelRequest.update({ travelportRecordLocator: recordLocator })
  }
}

export default LinkTravelportBookingService
