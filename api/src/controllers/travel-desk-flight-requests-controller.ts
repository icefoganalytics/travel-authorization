import { isNil } from "lodash"

import { TravelDeskFlightRequest, TravelDeskTravelRequest } from "@/models"
import { TravelDeskFlightRequestsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-flight-requests"

import BaseController from "@/controllers/base-controller"

export class TravelDeskFlightRequestsController extends BaseController<TravelDeskFlightRequest> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["datePreference", "ASC"]])
      const scopedTravelDeskFlightRequests = TravelDeskFlightRequestsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskFlightRequests.count({ where })
      const travelDeskFlightRequests = await scopedTravelDeskFlightRequests.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        include: [
          {
            association: "flightOptions",
            include: ["flightSegments"],
          },
        ],
      })
      return this.response.status(200).json({
        travelDeskFlightRequests,
        totalCount,
      })
    } catch (error) {
      console.error(`Failed to retrieve travel desk flight requests: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk flight requests: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskFlightRequest = await this.loadTravelDeskFlightRequest()
      if (isNil(travelDeskFlightRequest)) {
        return this.response.status(404).json({
          message: "Flight request not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightRequest)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this flight request.",
        })
      }

      return this.response.status(200).json({
        travelDeskFlightRequest,
        policy,
      })
    } catch (error) {
      console.error(`Failed to retrieve travel desk flight request: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk flight request: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelDeskFlightRequest = await this.buildTravelDeskFlightRequest()
      const policy = this.buildPolicy(travelDeskFlightRequest)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this flight request.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskFlightRequest = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({
        travelDeskFlightRequest: newTravelDeskFlightRequest,
        policy,
      })
    } catch (error) {
      console.error(`Failed to create travel desk flight request: ${error}`, { error })
      return this.response.status(422).json({
        message: `Flight request creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskFlightRequest = await this.loadTravelDeskFlightRequest()
      if (isNil(travelDeskFlightRequest)) {
        return this.response.status(404).json({
          message: "Flight request not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightRequest)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this flight request.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskFlightRequest = await UpdateService.perform(
        travelDeskFlightRequest,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskFlightRequest: updatedTravelDeskFlightRequest,
        policy,
      })
    } catch (error) {
      console.error(`Failed to update travel desk flight request: ${error}`, { error })
      return this.response.status(422).json({
        message: `Flight request update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskFlightRequest = await this.loadTravelDeskFlightRequest()
      if (isNil(travelDeskFlightRequest)) {
        return this.response.status(404).json({
          message: "Flight request not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightRequest)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this flight request.",
        })
      }

      await travelDeskFlightRequest.destroy()
      return this.response.status(204).send()
    } catch (error) {
      return this.response.status(422).json({
        message: `Flight request deletion failed: ${error}`,
      })
    }
  }

  private async buildTravelDeskFlightRequest(): Promise<TravelDeskFlightRequest> {
    const travelDeskFlightRequest = TravelDeskFlightRequest.build(this.request.body)

    const { travelRequestId } = travelDeskFlightRequest
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelRequestId, {
      include: ["travelAuthorization"],
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new Error(`Travel request not found for travelRequestId=${travelRequestId}`)
    }

    travelDeskFlightRequest.travelRequest = travelDeskTravelRequest

    return travelDeskFlightRequest
  }

  private loadTravelDeskFlightRequest(): Promise<TravelDeskFlightRequest | null> {
    return TravelDeskFlightRequest.findByPk(this.params.travelDeskFlightRequestId, {
      include: [
        // required for policy check
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
  }

  private buildPolicy(travelDeskFlightRequest: TravelDeskFlightRequest) {
    return new TravelDeskFlightRequestsPolicy(this.currentUser, travelDeskFlightRequest)
  }
}

export default TravelDeskFlightRequestsController
