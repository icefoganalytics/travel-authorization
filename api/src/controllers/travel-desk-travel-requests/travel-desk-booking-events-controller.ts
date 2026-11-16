import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskBookingEvent, TravelDeskTravelRequest } from "@/models"

import { TravelDeskTravelRequests } from "@/policies"

import { SyncService } from "@/services/travel-desk-booking-events"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

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

      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["databaseTimestamp", "DESC"],
        ["id", "DESC"],
      ])
      const scopedTravelDeskBookingEvents = TravelDeskBookingEvent.withScope(scopes)

      const totalCount = await scopedTravelDeskBookingEvents.count({ where })
      const travelDeskBookingEvents = await scopedTravelDeskBookingEvents.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      const serializedTravelDeskBookingEvents = IndexSerializer.perform(travelDeskBookingEvents)

      return this.response.status(200).json({
        travelDeskBookingEvents: serializedTravelDeskBookingEvents,
        totalCount,
      })
    } catch (error) {
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

      const { recordLocator } = this.request.body
      await SyncService.perform(recordLocator)
      return this.response.status(204).send()
    } catch (error) {
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
