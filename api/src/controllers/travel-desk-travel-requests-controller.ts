import { col } from "@sequelize/core"
import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import { UpdateService } from "@/services/travel-desk-travel-requests"
import { IndexSerializer, ShowSerializer } from "@/serializers/travel-desk-travel-requests"

import BaseController from "@/controllers/base-controller"

export class TravelDeskTravelRequestsController extends BaseController<TravelDeskTravelRequest> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes([
        "includeIsBookedAttribute",
        "includeTravelStartDateAttribute",
        { method: ["includeIsAssignedToCurrentUserAttribute", this.currentUser.displayName] },
      ])
      const order = this.buildOrder([
        [col("isBooked"), "asc"],
        [col("isAssignedToCurrentUser"), "desc"],
      ])
      const scopedTravelDeskTravelRequests = TravelDeskTravelRequestsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskTravelRequests.count({ where })
      const travelDeskTravelRequests = await scopedTravelDeskTravelRequests.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        include: [
          "flightRequests",
          "hotels",
          "otherTransportations",
          "passengerNameRecordDocument",
          "rentalCars",
          {
            association: "travelAuthorization",
            required: true,
            include: [
              "user",
              {
                association: "travelSegments",
                separate: true,
                order: [["segmentNumber", "ASC"]],
                include: ["departureLocation", "arrivalLocation"],
              },
            ],
          },
        ],
      })
      const serializedTravelDeskTravelRequests = IndexSerializer.perform(
        travelDeskTravelRequests,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskTravelRequests: serializedTravelDeskTravelRequests,
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to retrieve travel desk requests: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk requests: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({ message: "Travel desk request not found." })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk request.",
        })
      }

      const serializedTravelDeskTravelRequest = ShowSerializer.perform(
        travelDeskTravelRequest,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskTravelRequest: serializedTravelDeskTravelRequest,
        policy,
      })
    } catch (error) {
      logger.error(`Failed to retrieve travel desk request: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk request ${error}`,
      })
    }
  }

  async create() {
    throw new Error("Not implemented, model created internally")
  }

  async update() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk request not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelRequest)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel desk request.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskTravelRequest = await UpdateService.perform(
        travelDeskTravelRequest,
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelDeskTravelRequest = ShowSerializer.perform(
        updatedTravelDeskTravelRequest,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskTravelRequest: serializedTravelDeskTravelRequest,
        policy,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to update travel desk request: ${error}`,
      })
    }
  }

  private async loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    return TravelDeskTravelRequest.findByPk(this.params.travelDeskTravelRequestId, {
      include: [
        "flightRequests",
        "hotels",
        "otherTransportations",
        "passengerNameRecordDocument",
        "rentalCars",
        {
          association: "travelAuthorization",
          required: true,
          include: [
            "user",
            {
              association: "travelSegments",
              separate: true,
              order: [["segmentNumber", "ASC"]],
              include: ["departureLocation", "arrivalLocation"],
            },
          ],
        },
      ],
    })
  }

  private buildPolicy(
    travelDeskTravelRequest: TravelDeskTravelRequest
  ): TravelDeskTravelRequestsPolicy {
    return new TravelDeskTravelRequestsPolicy(this.currentUser, travelDeskTravelRequest)
  }
}

export default TravelDeskTravelRequestsController
