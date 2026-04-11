import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskFlightOption } from "@/models"
import { TravelDeskFlightOptionsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-flight-options"

import BaseController from "@/controllers/base-controller"

export class TravelDeskFlightOptionsController extends BaseController<TravelDeskFlightOption> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["createdAt", "ASC"]])

      const scopedFlightOptions = TravelDeskFlightOptionsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedFlightOptions.count({ where })
      const travelDeskFlightOptions = await scopedFlightOptions.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        include: ["flightSegments"],
      })
      return this.response.status(200).json({
        travelDeskFlightOptions,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel desk flight options: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk flight options: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskFlightOption = await this.loadTravelDeskFlightOption()
      if (isNil(travelDeskFlightOption)) {
        return this.response.status(404).json({
          message: "Travel desk flight option not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightOption)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk flight option.",
        })
      }

      return this.response.status(200).json({
        travelDeskFlightOption,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching flight option: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve flight option: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel desk flight options.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelDeskFlightOption = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({
        travelDeskFlightOption,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to create travel desk flight option: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskFlightOption = await this.loadTravelDeskFlightOption()
      if (isNil(travelDeskFlightOption)) {
        return this.response.status(404).json({
          message: "Travel desk flight option not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightOption)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel desk flight option.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      await UpdateService.perform(travelDeskFlightOption, permittedAttributes, this.currentUser)

      return this.response.status(200).json({
        travelDeskFlightOption,
      })
    } catch (error) {
      logger.error(`Error updating travel desk flight option: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel desk flight option: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskFlightOption = await this.loadTravelDeskFlightOption()
      if (isNil(travelDeskFlightOption)) {
        return this.response.status(404).json({
          message: "Travel desk flight option not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskFlightOption)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel desk flight option.",
        })
      }

      await travelDeskFlightOption.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel desk flight option: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to delete travel desk flight option: ${error}`,
      })
    }
  }

  private async loadTravelDeskFlightOption() {
    return await TravelDeskFlightOption.findByPk(this.params.travelDeskFlightOptionId)
  }

  private buildPolicy(
    travelDeskFlightOption: TravelDeskFlightOption = TravelDeskFlightOption.build()
  ) {
    return new TravelDeskFlightOptionsPolicy(this.currentUser, travelDeskFlightOption)
  }
}

export default TravelDeskFlightOptionsController
