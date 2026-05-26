import logger from "@/utils/logger"

import { TravelAuthorizationActionLog } from "@/models"
import { TravelAuthorizationActionLogsPolicy } from "@/policies"
import { IndexSerializer } from "@/serializers/travel-authorization-action-logs"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationActionLogsController extends BaseController<TravelAuthorizationActionLog> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["createdAt", "ASC"]])
      const scopedTravelAuthorizationActionLogs = TravelAuthorizationActionLogsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelAuthorizationActionLogs.count({ where })
      const travelAuthorizationActionLogs = await scopedTravelAuthorizationActionLogs.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      const serializedTravelAuthorizationActionLogs = IndexSerializer.perform(
        travelAuthorizationActionLogs,
        this.currentUser
      )
      return this.response.json({
        travelAuthorizationActionLogs: serializedTravelAuthorizationActionLogs,
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to fetch travel authorization action logs: ${error}`, { error })
      return this.response.status(400).json({
        error: "Failed to fetch travel authorization action logs",
      })
    }
  }
}

export default TravelAuthorizationActionLogsController
