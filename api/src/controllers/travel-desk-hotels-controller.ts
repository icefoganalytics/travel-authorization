import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskHotel, TravelDeskTravelRequest } from "@/models"
import { TravelDeskHotelsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-hotels"
import { IndexSerializer } from "@/serializers/travel-desk-hotels"

import BaseController from "@/controllers/base-controller"

export class TravelDeskHotelsController extends BaseController<TravelDeskHotel> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedTravelDeskHotels = TravelDeskHotelsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelDeskHotels.count({ where })
      const travelDeskHotels = await scopedTravelDeskHotels.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedTravelDeskHotels = IndexSerializer.perform(travelDeskHotels, this.currentUser)
      return this.response.status(200).json({
        travelDeskHotels: serializedTravelDeskHotels,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error retrieving travel desk hotels: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk hotels: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskHotel = await this.loadTravelDeskHotel()
      if (isNil(travelDeskHotel)) {
        return this.response.status(404).json({
          message: "Travel desk hotel not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskHotel)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk hotel.",
        })
      }

      const serializedTravelDeskHotel = IndexSerializer.perform(travelDeskHotel, this.currentUser)
      return this.response.json({
        travelDeskHotel: serializedTravelDeskHotel,
        policy,
      })
    } catch (error) {
      logger.error(`Error retrieving travel desk hotel: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk hotel: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelDeskHotel = await this.buildTravelDeskHotel()
      const policy = this.buildPolicy(travelDeskHotel)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this hotel.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskHotel = await CreateService.perform(permittedAttributes, this.currentUser)
      const serializedTravelDeskHotel = IndexSerializer.perform(
        newTravelDeskHotel,
        this.currentUser
      )
      return this.response.status(201).json({
        travelDeskHotel: serializedTravelDeskHotel,
        policy,
      })
    } catch (error) {
      logger.error(`Error creating travel desk hotel: ${error}`, { error })
      return this.response.status(422).json({
        message: `Hotel creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskHotel = await this.loadTravelDeskHotel()
      if (isNil(travelDeskHotel)) {
        return this.response.status(404).json({
          message: "Travel desk hotel not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskHotel)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel desk hotel.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskHotel = await UpdateService.perform(
        travelDeskHotel,
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelDeskHotel = IndexSerializer.perform(
        updatedTravelDeskHotel,
        this.currentUser
      )
      return this.response.json({
        travelDeskHotel: serializedTravelDeskHotel,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel desk hotel: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel desk hotel update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskHotel = await this.loadTravelDeskHotel()
      if (isNil(travelDeskHotel)) {
        return this.response.status(404).json({
          message: "Travel desk hotel not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskHotel)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel desk hotel.",
        })
      }

      await travelDeskHotel.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel desk hotel: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel desk hotel deletion failed: ${error}`,
      })
    }
  }

  private async buildTravelDeskHotel(): Promise<TravelDeskHotel> {
    const travelDeskHotel = TravelDeskHotel.build(this.request.body)

    const { travelRequestId } = travelDeskHotel
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelRequestId, {
      include: ["travelAuthorization"],
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new Error(`Travel request not found for travelRequestId=${travelRequestId}`)
    }

    travelDeskHotel.travelRequest = travelDeskTravelRequest

    return travelDeskHotel
  }

  private loadTravelDeskHotel(): Promise<TravelDeskHotel | null> {
    return TravelDeskHotel.findByPk(this.params.travelDeskHotelId, {
      include: [
        // required for policy check
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
  }

  private buildPolicy(travelDeskHotel: TravelDeskHotel) {
    return new TravelDeskHotelsPolicy(this.currentUser, travelDeskHotel)
  }
}

export default TravelDeskHotelsController
