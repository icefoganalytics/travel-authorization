import { DateTime } from "luxon"

import logger from "@/utils/logger"
import { type FlightStatistic } from "@/models"
import { FlightStatisticsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/flight-statistics/create-csv-service"
import BaseController from "@/controllers/base-controller"

export class FlightStatisticsController extends BaseController<FlightStatistic> {
  async create() {
    try {
      if (this.query.format !== "csv") {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }

      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["departmentMailcode", "ASC"],
        ["destinationCity", "ASC"],
      ])
      const scopedFlightStatistics = FlightStatisticsPolicy.applyScope(scopes, this.currentUser)
      const fileBuffer = await CreateCsvService.perform(scopedFlightStatistics, where, order)

      const fileName = this.buildFileName()

      this.response.attachment(fileName)
      this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

      return this.response.status(200).send(fileBuffer)
    } catch (error) {
      logger.error(`Failed to create flight statistics download: ${error}`, { error })

      return this.response.status(422).json({
        message: "Failed to create flight statistics download",
      })
    }
  }

  private buildFileName(): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

    return `Export, Flight Statistics, ${date}.csv`
  }
}

export default FlightStatisticsController
