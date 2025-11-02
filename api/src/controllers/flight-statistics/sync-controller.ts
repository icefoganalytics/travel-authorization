import logger from "@/utils/logger"

import { FlightStatistic } from "@/models"
import { FlightStatisticsPolicy } from "@/policies"
import { SyncService } from "@/services/flight-statistics"
import BaseController from "@/controllers/base-controller"

export class SyncController extends BaseController<FlightStatistic> {
  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to sync flight statistics.",
        })
      }

      await SyncService.perform(this.currentUser)

      return this.response.status(201).json({
        message: "Flight statistics sync started successfully.",
      })
    } catch (error) {
      logger.error(`Error syncing flight statistics: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to sync flight statistics: ${error}`,
      })
    }
  }

  private buildPolicy(flightStatistic: FlightStatistic = FlightStatistic.build()) {
    return new FlightStatisticsPolicy(this.currentUser, flightStatistic)
  }
}

export default SyncController
