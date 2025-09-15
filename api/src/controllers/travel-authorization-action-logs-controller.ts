import { WhereOptions } from "@sequelize/core"

import { TravelAuthorizationActionLog } from "@/models"
import { TravelAuthorizationActionLogsSerializer } from "@/serializers"

import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationActionLogsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<TravelAuthorizationActionLog>
    // TODO: add policy scoping to query

    return TravelAuthorizationActionLog.findAll({
      where,
      order: [["createdAt", "ASC"]],
    }).then((travelAuthorizationActionLogs) => {
      const serializedTravelAuthorizationActionLogs =
        TravelAuthorizationActionLogsSerializer.asTable(travelAuthorizationActionLogs)
      return this.response.json({
        travelAuthorizationActionLogs: serializedTravelAuthorizationActionLogs,
      })
    })
  }
}

export default TravelAuthorizationActionLogsController
