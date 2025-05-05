import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorization, TravelSegment } from "@/models"
import { TravelSegmentsPolicy } from "@/policies"
import { CreateService, DestroyService, UpdateService } from "@/services/travel-segments"
import { ShowSerializer } from "@/serializers/travel-segments"
import BaseController from "@/controllers/base-controller"

export class TravelSegmentsController extends BaseController<TravelSegment> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["segmentNumber", "ASC"]])

      const scopedTravelSegments = TravelSegmentsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelSegments.count({ where })
      const travelSegments = await scopedTravelSegments.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.json({
        travelSegments,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel segments: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel segments: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelSegment = await this.loadTravelSegment()
      if (isNil(travelSegment)) {
        return this.response.status(404).json({
          message: "Travel segment not found.",
        })
      }

      const policy = this.buildPolicy(travelSegment)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel segment.",
        })
      }

      const serializedTravelSegment = ShowSerializer.perform(travelSegment, this.currentUser)

      return this.response.status(200).json({
        travelSegment: serializedTravelSegment,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching travel segment: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel segment: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelSegmentForPolicy = await this.buildTravelSegment()
      const policy = this.buildPolicy(travelSegmentForPolicy)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel segments.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelSegment = await CreateService.perform(permittedAttributes, this.currentUser)
      const serializedTravelSegment = ShowSerializer.perform(travelSegment, this.currentUser)

      return this.response.status(201).json({
        travelSegment: serializedTravelSegment,
      })
    } catch (error) {
      logger.error(`Error creating travel segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to create travel segment: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelSegment = await this.loadTravelSegment()
      if (isNil(travelSegment)) {
        return this.response.status(404).json({
          message: "Travel segment not found.",
        })
      }

      const policy = this.buildPolicy(travelSegment)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel segment.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      await UpdateService.perform(travelSegment, permittedAttributes, this.currentUser)
      const serializedTravelSegment = ShowSerializer.perform(travelSegment, this.currentUser)

      return this.response.status(200).json({
        travelSegment: serializedTravelSegment,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel segment: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelSegment = await this.loadTravelSegment()
      if (isNil(travelSegment)) {
        return this.response.status(404).json({
          message: "Travel segment not found.",
        })
      }

      const policy = this.buildPolicy(travelSegment)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel segment.",
        })
      }

      await DestroyService.perform(travelSegment, this.currentUser)
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel segment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to delete travel segment: ${error}`,
      })
    }
  }

  private async loadTravelSegment() {
    return await TravelSegment.findByPk(this.params.travelSegmentId, {
      include: ["travelAuthorization"],
    })
  }

  private async buildTravelSegment() {
    // TODO: develop safer pattern for this
    // this could potentially cause a permission leak see https://yg-hpw.atlassian.net/browse/WRAPX-126
    const travelSegment = TravelSegment.build(this.request.body)

    // TODO: consider if it would be best to nest this under the travel authorization?
    // e.g. /api/travel-authorizations/:travelAuthorizationId/travel-segments
    const { travelAuthorizationId } = this.request.body
    const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId)
    if (isNil(travelAuthorization)) {
      throw new Error("Travel authorization not found.")
    }

    travelSegment.travelAuthorization = travelAuthorization

    return travelSegment
  }

  private buildPolicy(travelSegment: TravelSegment) {
    return new TravelSegmentsPolicy(this.currentUser, travelSegment)
  }
}

export default TravelSegmentsController
