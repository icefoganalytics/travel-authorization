import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskFlightSegment } from "@/models"
import { TravelDeskFlightSegmentsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-flight-segments"

import BaseController from "@/controllers/base-controller"

export class TravelDeskFlightSegmentsController extends BaseController<TravelDeskFlightSegment> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["sortOrder", "ASC"]])

      const scopedTravelDeskFlightSegments = TravelDeskFlightSegmentsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskFlightSegments.count({ where })
      const travelDeskFlightSegments = await scopedTravelDeskFlightSegments.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.status(200).json({
        travelDeskFlightSegments,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel desk flight segments: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk flight segments: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskFlightSegment = await this.loadTravelDeskFlightSegment()
      if (isNil(travelDeskFlightSegment)) {
        return this.response.status(404).json({
          message: "Travel desk flight segment not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightSegment)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk flight segment.",
        })
      }

      return this.response.status(200).json({
        travelDeskFlightSegment,
        policy,
      })
    } catch (error) {
      logger.error(`Error retrieving travel desk flight segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to retrieve travel desk flight segment: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel desk flight segments.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelDeskFlightSegment = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )

      return this.response.status(201).json({
        travelDeskFlightSegment,
      })
    } catch (error) {
      logger.error(`Error creating travel desk flight segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to create travel desk flight segment: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskFlightSegment = await this.loadTravelDeskFlightSegment()
      if (isNil(travelDeskFlightSegment)) {
        return this.response.status(404).json({
          message: "Travel desk flight segment not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightSegment)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel desk flight segment.",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      const updatedTravelDeskFlightSegment = await UpdateService.perform(
        travelDeskFlightSegment,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskFlightSegment: updatedTravelDeskFlightSegment,
      })
    } catch (error) {
      logger.error(`Error updating travel desk flight segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel desk flight segment: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskFlightSegment = await this.loadTravelDeskFlightSegment()
      if (isNil(travelDeskFlightSegment)) {
        return this.response.status(404).json({
          message: "Travel desk flight segment not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightSegment)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel desk flight segment.",
        })
      }

      await travelDeskFlightSegment.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel desk flight segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to delete travel desk flight segment: ${error}`,
      })
    }
  }

  private async loadTravelDeskFlightSegment() {
    return TravelDeskFlightSegment.findByPk(this.params.travelDeskFlightSegmentId, {
      include: ["flightOption"],
    })
  }

  private buildPolicy(
    travelDeskFlightSegment: TravelDeskFlightSegment = TravelDeskFlightSegment.build()
  ) {
    return new TravelDeskFlightSegmentsPolicy(this.currentUser, travelDeskFlightSegment)
  }
}

export default TravelDeskFlightSegmentsController
