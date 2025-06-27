import { CreationAttributes } from "@sequelize/core"

import db from "@/db/db-client"

import { Stop } from "@/models"
import BaseService from "./base-service"

export class StopsService extends BaseService {
  // Probably should include validation around oneWayTrip/MultiStop parameters?
  static async bulkCreate(
    travelAuthorizationId: number,
    stops: CreationAttributes<Stop>[]
  ): Promise<Stop[]> {
    if (!stops.every((stop) => stop.travelAuthorizationId === travelAuthorizationId)) {
      throw new Error("All stops must belong to the same form.")
    }

    return Stop.bulkCreate(stops)
  }

  static async bulkReplace(
    travelAuthorizationId: number,
    stops: CreationAttributes<Stop>[]
  ): Promise<Stop[]> {
    if (!stops.every((stop) => stop.travelAuthorizationId === travelAuthorizationId)) {
      throw new Error("All stops must belong to the same form.")
    }

    return db.transaction(async () => {
      await Stop.destroy({ where: { travelAuthorizationId } })
      return Stop.bulkCreate(stops)
    })
  }
}

export default StopsService
