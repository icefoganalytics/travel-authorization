import { type Attributes, type WhereOptions } from "@sequelize/core"
import { type Response } from "express"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { type FlightStatistic } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
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
        return await this.respondWithCsv(
          this.response,
          scopedFlightStatistics,
          where,
          order
        )
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
    response: Response,
    scopedFlightStatistics: BaseModelConstructor<FlightStatistic>,
    where: WhereOptions<Attributes<FlightStatistic>>,
    order: ModelOrder[] | undefined
  ) {
    const fileName = this.buildFileName()
    response.status(200).attachment(fileName)
    response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return CreateCsvService.perform(response, scopedFlightStatistics, where, order)
  }

  private buildFileName(): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

    return `Export, Flight Statistics, ${date}.csv`
  }
}

export default FlightStatisticsController
