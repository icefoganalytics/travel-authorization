import logger from "@/utils/logger"

import { Stop } from "@/models"
import BaseController from "@/controllers/base-controller"
import { StopPolicy } from "@/policies"

export class StopsController extends BaseController<Stop> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["departureDate", "ASC"],
        ["departureTime", "ASC"],
      ])
      const scopedStops = StopPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedStops.count({ where })
      const stops = await scopedStops.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      return this.response.json({
        stops,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching stops: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve stops: ${error}`,
      })
    }
  }
}

export default StopsController
