import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskTravelRequest } from "@/models"

import { TravelDeskTravelRequests } from "@/policies"

import ServiceValidationError from "@/services/service-validation-error"
import { SyncService } from "@/services/travel-desk-booking-events"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import { RequireLinkedTravelPortBookingService } from "@/services/travel-desk-travel-requests/require-linked-travel-port-booking-service"

import BaseController from "@/controllers/base-controller"

export class SyncController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to access booking sources.",
        })
      }

      const bookingReference = RequireLinkedTravelPortBookingService.perform(travelDeskTravelRequest)
      await SyncService.perform(bookingReference)
      return this.response.status(204).send()
    } catch (error) {
      if (error instanceof ServiceValidationError) {
        return this.response.status(422).json({ message: error.message })
      }

      if (error instanceof SourceUnavailableError) {
        return this.response.status(503).json({
          message: "Booking source is unavailable.",
        })
      }

      logger.error(`Failed to sync travel desk booking events: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: "Failed to sync booking history.",
      })
    }
  }

  private loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    return TravelDeskTravelRequest.findByPk(this.params.travelDeskTravelRequestId)
  }

  private buildPolicy(
    travelDeskTravelRequest: TravelDeskTravelRequest
  ): TravelDeskTravelRequests.TravelDeskBookingEventsPolicy {
    return new TravelDeskTravelRequests.TravelDeskBookingEventsPolicy(
      this.currentUser,
      travelDeskTravelRequest
    )
  }
}

export default SyncController
