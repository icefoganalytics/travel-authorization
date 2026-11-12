import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskBookingEvent, TravelDeskTravelRequest } from "@/models"

import { TravelDeskTravelRequests } from "@/policies"

import { SyncService } from "@/services/travel-desk-booking-events"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { RequireLinkedTravelportBookingService } from "@/services/travel-desk-travel-requests/require-linked-travelport-booking-service"

import { IndexSerializer } from "@/serializers/travel-desk-booking-events"

import BaseController from "@/controllers/base-controller"

export class TravelDeskBookingEventsController extends BaseController<TravelDeskBookingEvent> {
  async index() {
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

      const recordLocator = RequireLinkedTravelportBookingService.perform(travelDeskTravelRequest)
      const where = { recordLocator }
      const { limit, offset } = this.pagination
      const totalCount = await TravelDeskBookingEvent.count({ where })
      const travelDeskBookingEvents = await TravelDeskBookingEvent.findAll({
        where,
        order: [["externalTravelPortIdentifier", "ASC"]],
        limit,
        offset,
      })
      const serializedTravelDeskBookingEvents = IndexSerializer.perform(travelDeskBookingEvents)

      return this.response.status(200).json({
        travelDeskBookingEvents: serializedTravelDeskBookingEvents,
        totalCount,
      })
    } catch (error) {
      if (error instanceof InvoiceValidationError) {
        return this.response.status(422).json({ message: error.message })
      }

      logger.error(`Failed to index travel desk booking events: ${error}`, { error })
      return this.response.status(400).json({
        message: "Failed to load booking history.",
      })
    }
  }

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

      const recordLocator = RequireLinkedTravelportBookingService.perform(travelDeskTravelRequest)
      await SyncService.perform(recordLocator)
      return this.response.status(204).send()
    } catch (error) {
      if (error instanceof InvoiceValidationError) {
        return this.response.status(422).json({
          message: error.message,
        })
      }

      if (error instanceof SourceUnavailableError) {
        return this.response.status(503).json({
          message: "Booking source is unavailable.",
        })
      }

      logger.error(`Failed to sync travel desk booking events: ${error}`, { error })
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

export default TravelDeskBookingEventsController
