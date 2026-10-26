import logger from "@/utils/logger"

import { TravelAuthorization } from "@/models"
import { TravelDeskTravelAuthorizationsPolicy } from "@/policies"
import { IndexSerializer } from "@/serializers/travel-desk-travel-authorizations"
import BaseController from "@/controllers/base-controller"

export class IndexController extends BaseController<TravelAuthorization> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["updatedAt", "DESC"],
        ["id", "DESC"],
      ])
      const scopedTravelAuthorizations = TravelDeskTravelAuthorizationsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelAuthorizations.count({ where })
      const travelAuthorizations = await scopedTravelAuthorizations.findAll({
        where,
        include: [
          "purpose",
          "travelDeskTravelRequest",
          {
            association: "stops",
            separate: true,
            where: { isActual: false },
            order: [
              ["departureDate", "ASC"],
              ["departureTime", "ASC"],
            ],
          },
          {
            association: "travelSegments",
            separate: true,
            where: { isActual: false },
            order: [["segmentNumber", "ASC"]],
          },
        ],
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedTravelAuthorizations = IndexSerializer.perform(travelAuthorizations)

      return this.response.status(200).json({
        travelAuthorizations: serializedTravelAuthorizations,
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to retrieve Travel Desk travel authorizations: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve Travel Desk travel authorizations: ${error}`,
      })
    }
  }
}
