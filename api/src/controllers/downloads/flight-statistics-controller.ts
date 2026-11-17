import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { type FlightStatistic } from "@/models"
import { FlightStatisticsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/flight-statistics/create-csv-service"
import BaseController, { type ModelOrder } from "@/controllers/base-controller"

export class FlightStatisticsController extends BaseController<FlightStatistic> {
  async create() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["departmentMailcode", "ASC"],
        ["destinationCity", "ASC"],
        ["id", "ASC"],
      ])
      const scopedFlightStatistics = FlightStatisticsPolicy.applyScope(scopes, this.currentUser)

      if (this.query.format === "csv") {
        return await this.respondWithCsv(scopedFlightStatistics, where, order)
      } else {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }
    } catch (error) {
      logger.error(`Failed to create flight statistics download: ${error}`, { error })

      if (this.response.headersSent) {
        this.response.destroy()
        return
      }

      return this.response.status(422).json({
        message: "Failed to create flight statistics download",
      })
    }
  }

  private async respondWithCsv(
    scopedFlightStatistics: ModelStatic<FlightStatistic>,
    where: WhereOptions<Attributes<FlightStatistic>>,
    order: ModelOrder[] | undefined
  ) {
    const fileName = this.buildFileName()
    this.response.status(200).attachment(fileName)
    this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return CreateCsvService.perform(scopedFlightStatistics, where, order, this.response)
  }

  private buildFileName(): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

    return `Export, Flight Statistics, ${date}.csv`
  }
}

export default FlightStatisticsController
