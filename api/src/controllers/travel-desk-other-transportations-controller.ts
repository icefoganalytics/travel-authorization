import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskOtherTransportation, TravelDeskTravelRequest } from "@/models"
import { TravelDeskOtherTransportationsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-other-transportations"
import { IndexSerializer } from "@/serializers/travel-desk-other-transportations"

import BaseController from "@/controllers/base-controller"

export class TravelDeskOtherTransportationsController extends BaseController<TravelDeskOtherTransportation> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedTravelDeskOtherTransportations = TravelDeskOtherTransportationsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskOtherTransportations.count({ where })
      const travelDeskOtherTransportations = await scopedTravelDeskOtherTransportations.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedTravelDeskOtherTransportations = IndexSerializer.perform(
        travelDeskOtherTransportations,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskOtherTransportations: serializedTravelDeskOtherTransportations,
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to retrieve travel desk other transportations: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk other transportations: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskOtherTransportation = await this.loadTravelDeskOtherTransportation()
      if (isNil(travelDeskOtherTransportation)) {
        return this.response.status(404).json({
          message: "Travel desk other transportation not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk other transportation.",
        })
      }

      return this.response.json({
        travelDeskOtherTransportation,
        policy,
      })
    } catch (error) {
      logger.error(`Error retrieving travel desk other transportation: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk other transportation: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelDeskOtherTransportation = await this.buildTravelDeskOtherTransportation()
      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this other transportation.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskOtherTransportation = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({
        travelDeskOtherTransportation: newTravelDeskOtherTransportation,
        policy,
      })
    } catch (error) {
      logger.error(`Error creating travel desk other transportation: ${error}`, { error })
      return this.response.status(422).json({
        message: `Other transportation creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskOtherTransportation = await this.loadTravelDeskOtherTransportation()
      if (isNil(travelDeskOtherTransportation)) {
        return this.response.status(404).json({
          message: "Other transportation not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this other transportation.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskOtherTransportation = await UpdateService.perform(
        travelDeskOtherTransportation,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskOtherTransportation: updatedTravelDeskOtherTransportation,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel desk other transportation: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error updating other transportation: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskOtherTransportation = await this.loadTravelDeskOtherTransportation()
      if (isNil(travelDeskOtherTransportation)) {
        return this.response.status(404).json({
          message: "Other transportation not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this other transportation.",
        })
      }

      await travelDeskOtherTransportation.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel desk other transportation: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error deleting other transportation: ${error}`,
      })
    }
  }

  private async buildTravelDeskOtherTransportation(): Promise<TravelDeskOtherTransportation> {
    const travelDeskOtherTransportation = TravelDeskOtherTransportation.build(this.request.body)

    const { travelRequestId } = travelDeskOtherTransportation
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelRequestId, {
      include: ["travelAuthorization"],
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new Error(`Travel request not found for travelRequestId=${travelRequestId}`)
    }

    travelDeskOtherTransportation.travelRequest = travelDeskTravelRequest

    return travelDeskOtherTransportation
  }

  private loadTravelDeskOtherTransportation(): Promise<TravelDeskOtherTransportation | null> {
    return TravelDeskOtherTransportation.findByPk(this.params.travelDeskOtherTransportationId, {
      include: [
        // required for policy check
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
  }

  private buildPolicy(travelDeskOtherTransportation: TravelDeskOtherTransportation) {
    return new TravelDeskOtherTransportationsPolicy(this.currentUser, travelDeskOtherTransportation)
  }
}

export default TravelDeskOtherTransportationsController
