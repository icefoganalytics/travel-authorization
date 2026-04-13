import { WhereOptions } from "@sequelize/core"

import { TravelAuthorizationActionLog } from "@/models"
import { IndexSerializer } from "@/serializers/travel-authorization-action-logs"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationActionLogsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<TravelAuthorizationActionLog>
    // TODO: add policy scoping to query

    const totalCount = await TravelAuthorizationActionLog.count({ where })
    const travelAuthorizationActionLogs = await TravelAuthorizationActionLog.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      order: [["createdAt", "ASC"]],
    })
    const serializedTravelAuthorizationActionLogs = IndexSerializer.perform(
      travelAuthorizationActionLogs,
      this.currentUser
    )
    return this.response.json({
      travelAuthorizationActionLogs: serializedTravelAuthorizationActionLogs,
      totalCount,
    })
  }
}

export default TravelAuthorizationActionLogsController
