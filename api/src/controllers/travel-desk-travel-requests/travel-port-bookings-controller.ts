import { isNil } from "lodash"

import logger from "@/utils/logger"
import { BookingsService } from "@/integrations/travel-port-integration/services/bookings-service"
import { TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequests } from "@/policies"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { LinkTravelPortBookingService } from "@/services/travel-desk-travel-requests/link-travel-port-booking-service"
import BaseController from "@/controllers/base-controller"

export class TravelPortBookingsController extends BaseController<TravelDeskTravelRequest> {
  async index() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({ message: "Travel desk travel request not found." })
      }

      const policy = new TravelDeskTravelRequests.TravelPortBookingsPolicy(
        this.currentUser,
        travelDeskTravelRequest
      )
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to access booking sources.",
        })
      }

      const { limit, offset } = this.pagination
      const bookings = await BookingsService.perform(this.query.search, limit, offset)
      return this.response.status(200).json(bookings)
    } catch (error) {
      if (error instanceof InvoiceValidationError) {
        return this.response.status(422).json({ message: error.message })
      }

      if (error instanceof SourceUnavailableError) {
        return this.response.status(503).json({ message: "Booking source is unavailable." })
      }

      logger.error("Failed to list TravelPort bookings.", { error })
      return this.response.status(400).json({ message: "Failed to load TravelPort bookings." })
    }
  }

  async update() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({ message: "Travel desk travel request not found." })
      }

      const policy = new TravelDeskTravelRequests.TravelPortBookingsPolicy(
        this.currentUser,
        travelDeskTravelRequest
      )
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to link TravelPort bookings.",
        })
      }

      await LinkTravelPortBookingService.perform(
        travelDeskTravelRequest,
        this.request.body.recordLocator
      )
      return this.response.status(204).send()
    } catch (error) {
      if (error instanceof InvoiceValidationError) {
        return this.response.status(422).json({ message: error.message })
      }

      if (error instanceof SourceUnavailableError) {
        return this.response.status(503).json({ message: "Booking source is unavailable." })
      }

      logger.error("Failed to link TravelPort booking.", { error })
      return this.response.status(400).json({ message: "Failed to link TravelPort booking." })
    }
  }

  private loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    return TravelDeskTravelRequest.findByPk(this.params.travelDeskTravelRequestId)
  }
}

export default TravelPortBookingsController
