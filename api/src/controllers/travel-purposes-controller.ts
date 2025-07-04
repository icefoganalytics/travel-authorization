import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelPurpose } from "@/models"
import BaseController from "@/controllers/base-controller"

export class TravelPurposesController extends BaseController<TravelPurpose> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["purpose", "ASC"]])

      const scopedTravelPurposes = TravelPurpose.withScope(scopes)

      const totalCount = await scopedTravelPurposes.count({ where })
      const travelPurposes = await scopedTravelPurposes.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.json({
        travelPurposes,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel purposes: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel purposes: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelPurpose = await this.loadTravelPurpose()
      if (isNil(travelPurpose)) {
        return this.response.status(404).json({
          message: "Travel Purpose not found",
        })
      }

      return this.response.json({
        travelPurpose,
      })
    } catch (error) {
      logger.error(`Error fetching travel purpose: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel purpose: ${error}`,
      })
    }
  }

  private async loadTravelPurpose() {
    return TravelPurpose.findByPk(this.params.travelPurposeId)
  }
}
