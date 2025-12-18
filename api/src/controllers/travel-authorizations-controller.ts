import { isNil } from "lodash"

import logger from "@/utils/logger"

import { UpdateService, CreateService, DestroyService } from "@/services/travel-authorizations"
import { TravelAuthorization } from "@/models"
import { TravelAuthorizationsPolicy } from "@/policies"
import { IndexSerializer, ShowSerializer } from "@/serializers/travel-authorizations"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationsController extends BaseController<TravelAuthorization> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["updatedAt", "DESC"],
        ["stops", "departureDate", "ASC"],
        ["stops", "departureTime", "ASC"],
      ])
      const scopedTravelAuthorizations = TravelAuthorizationsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelAuthorizations.count({ where })
      const travelAuthorizations = await scopedTravelAuthorizations.findAll({
        where,
        include: [
          {
            association: "stops",
            include: ["location"],
          },
          {
            association: "travelSegments",
            include: ["departureLocation", "arrivalLocation"],
          },
          "expenses",
          "purpose",
          "travelDeskTravelRequest",
          "user",
        ],
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedTravelAuthorizations = IndexSerializer.perform(
        travelAuthorizations,
        this.currentUser
      )
      return this.response.json({
        travelAuthorizations: serializedTravelAuthorizations,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorizations: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorizations: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({
          message: "Travel authorization not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.show()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to view this travel authorization." })
      }

      const serializedTravelAuthorization = ShowSerializer.perform(travelAuthorization)

      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
        policy,
      })
    } catch (error) {
      logger.error(`Error retrieving travel authorization: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorization: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelAuthorization = this.buildTravelAuthorization()
      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this travel authorization.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelAuthorization = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelAuthorization = ShowSerializer.perform(newTravelAuthorization)
      return this.response.status(201).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      logger.error(`Error submitting travel authorization: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel authorization submission failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({
          message: "Travel authorization not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel authorization.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelAuthorization = await UpdateService.perform(
        travelAuthorization,
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      logger.error(`Error updating travel authorization: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel authorization update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization))
        return this.response.status(404).json({
          message: "TravelAuthorization not found.",
        })

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel authorization.",
        })
      }

      await DestroyService.perform(travelAuthorization, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      logger.error(`Error deleting travel authorization: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel authorization deletion failed: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.withScope("asShow").findByPk(this.params.travelAuthorizationId)
  }

  private buildTravelAuthorization() {
    const attributes = this.request.body
    const travelAuthorization = TravelAuthorization.build(attributes)
    return travelAuthorization
  }

  private buildPolicy(record: TravelAuthorization): TravelAuthorizationsPolicy {
    return new TravelAuthorizationsPolicy(this.currentUser, record)
  }
}

export default TravelAuthorizationsController
