import { TravelDeskTravelRequest } from "@/models"
import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export class RequireLinkedTravelPortBookingService extends BaseService {
  constructor(protected travelDeskTravelRequest: TravelDeskTravelRequest) {
    super()
  }

  perform(): string {
    const { travelPortRecordLocator } = this.travelDeskTravelRequest
    if (travelPortRecordLocator === null) {
      throw new InvoiceValidationError("Link a TravelPort booking to this travel request first.")
    }

    return travelPortRecordLocator
  }
}

export default RequireLinkedTravelPortBookingService
