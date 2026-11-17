import { type Attributes, type WhereOptions } from "@sequelize/core"
import { type Response } from "express"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { type FlightReconciliation } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
import { FlightReconciliationsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"
import BaseController, { type ModelOrder } from "@/controllers/base-controller"

export class FlightReconciliationsController extends BaseController<FlightReconciliation> {
  async create() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ])
      const scopedFlightReconciliations = FlightReconciliationsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      if (this.query.format === "csv") {
        return await this.respondWithCsv(
          this.response,
          scopedFlightReconciliations,
          where,
          order
        )
      } else {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }
    } catch (error) {
      logger.error(`Failed to create flight reconciliations download: ${error}`, { error })

      if (this.response.headersSent) {
        this.response.destroy()
        return
      }

      return this.response.status(422).json({
        message: "Failed to create flight reconciliations download",
      })
    }
  }

  private async respondWithCsv(
    response: Response,
    scopedFlightReconciliations: BaseModelConstructor<FlightReconciliation>,
    where: WhereOptions<Attributes<FlightReconciliation>>,
    order: ModelOrder[] | undefined
  ) {
    const fileName = this.buildFileName()
    response.status(200).attachment(fileName)
    response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return CreateCsvService.perform(response, scopedFlightReconciliations, where, order)
  }

  private buildFileName(): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")

    return `Export, Flight Reconciliations, ${date}.csv`
  }
}

export default FlightReconciliationsController
