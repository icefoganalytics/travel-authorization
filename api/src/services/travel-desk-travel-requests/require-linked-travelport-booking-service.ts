import { TravelDeskTravelRequest } from "@/models"
import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export class RequireLinkedTravelportBookingService extends BaseService {
  constructor(protected travelDeskTravelRequest: TravelDeskTravelRequest) {
    super()
  }

  perform(): string {
    const { travelportRecordLocator } = this.travelDeskTravelRequest
    if (travelportRecordLocator === null) {
      throw new InvoiceValidationError("Link a Travelport booking to this travel request first.")
    }

    return travelportRecordLocator
  }
}

export default RequireLinkedTravelportBookingService
