import { DateTime } from "luxon"

import logger from "@/utils/logger"
import { type FlightReconciliation } from "@/models"
import { FlightReconciliationsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"
import BaseController from "@/controllers/base-controller"

export class FlightReconciliationsController extends BaseController<FlightReconciliation> {
  async create() {
    try {
      if (this.query.format !== "csv") {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }

      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["createdAt", "ASC"]])
      const scopedFlightReconciliations = FlightReconciliationsPolicy.applyScope(
        scopes,
        this.currentUser
      )
      const fileBuffer = await CreateCsvService.perform(scopedFlightReconciliations, where, order)

      const fileName = this.buildFileName()

      this.response.attachment(fileName)
      this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

      return this.response.status(200).send(fileBuffer)
    } catch (error) {
      logger.error(`Failed to create flight reconciliations download: ${error}`, { error })

      return this.response.status(422).json({
        message: "Failed to create flight reconciliations download",
      })
    }
  }

  private buildFileName(): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")

    return `Export, Flight Reconciliations, ${date}.csv`
  }
}

export default FlightReconciliationsController
