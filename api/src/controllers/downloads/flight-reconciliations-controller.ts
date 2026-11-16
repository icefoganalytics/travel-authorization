import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { DateTime } from "luxon"

import logger from "@/utils/logger"
import { type FlightReconciliation } from "@/models"
import { FlightReconciliationsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/flight-reconciliations/create-csv-service"
import BaseController, { type ModelOrder } from "@/controllers/base-controller"

const CSV_BYTE_ORDER_MARK = Buffer.from("\uFEFF")

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
      return await this.respondWithCsv(scopedFlightReconciliations, where, order)
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
    scopedFlightReconciliations: ModelStatic<FlightReconciliation>,
    where: WhereOptions<Attributes<FlightReconciliation>>,
    order: ModelOrder[] | undefined
  ) {
    const fileName = this.buildFileName()
    this.response.status(200).attachment(fileName)
    this.response.setHeader("Content-Type", "text/csv; charset=utf-8")
    this.response.flushHeaders()
    this.response.write(CSV_BYTE_ORDER_MARK)

    const fileBuffer = await CreateCsvService.perform(scopedFlightReconciliations, where, order)

    // The service includes the byte-order mark already sent to start the download.
    return this.response.end(fileBuffer.subarray(CSV_BYTE_ORDER_MARK.length))
  }

  private buildFileName(): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")

    return `Export, Flight Reconciliations, ${date}.csv`
  }
}

export default FlightReconciliationsController
