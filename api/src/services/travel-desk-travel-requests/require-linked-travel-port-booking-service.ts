import { TravelDeskTravelRequest } from "@/models"
import BaseService from "@/services/base-service"
import ServiceValidationError from "@/services/service-validation-error"

export class RequireLinkedTravelPortBookingService extends BaseService {
  constructor(protected travelDeskTravelRequest: TravelDeskTravelRequest) {
    super()
  }

  perform(): string {
    const { travelPortRecordLocator } = this.travelDeskTravelRequest
    if (travelPortRecordLocator === null) {
      throw new ServiceValidationError("Link a Travelport booking to this travel request first.")
    }

    return travelPortRecordLocator
  }
}

export default RequireLinkedTravelPortBookingService
