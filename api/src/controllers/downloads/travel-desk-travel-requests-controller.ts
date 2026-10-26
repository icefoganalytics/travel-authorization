import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { DateTime } from "luxon"
import { isUndefined } from "lodash"

import logger from "@/utils/logger"
import { type TravelDeskTravelRequest } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/travel-desk-travel-requests/create-csv-service"
import { CreatePdfService } from "@/services/downloads/travel-desk-travel-requests/create-pdf-service"
import BaseController, { type ModelOrder } from "@/controllers/base-controller"

export class TravelDeskTravelRequestsController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["id", "ASC"]])
      const scopedTravelDeskTravelRequests = TravelDeskTravelRequestsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      if (this.query.format === "csv") {
        return await this.respondWithCsv(scopedTravelDeskTravelRequests, where, order)
      } else if (this.query.format === "pdf") {
        return await this.respondWithPdf(scopedTravelDeskTravelRequests, where, order)
      } else {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }
    } catch (error) {
      logger.error(`Failed to create travel desk travel requests download: ${error}`, { error })

      return this.response.status(422).json({
        message: "Failed to create travel desk travel requests download",
      })
    }
  }

  private async respondWithCsv(
    scopedTravelDeskTravelRequests: ModelStatic<TravelDeskTravelRequest>,
    where: WhereOptions<Attributes<TravelDeskTravelRequest>>,
    order: ModelOrder[] | undefined
  ) {
    const fileBuffer = await CreateCsvService.perform(
      scopedTravelDeskTravelRequests,
      where,
      order,
      this.currentUser
    )
    if (isUndefined(fileBuffer)) {
      return this.response.status(404).json({
        message: "Travel desk travel requests were not found",
      })
    }

    const fileName = this.buildFileName("csv")

    this.response.attachment(fileName)
    this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return this.response.status(200).send(fileBuffer)
  }

  private async respondWithPdf(
    scopedTravelDeskTravelRequests: ModelStatic<TravelDeskTravelRequest>,
    where: WhereOptions<Attributes<TravelDeskTravelRequest>>,
    order: ModelOrder[] | undefined
  ) {
    const fileBuffer = await CreatePdfService.perform(
      scopedTravelDeskTravelRequests,
      where,
      order,
      this.currentUser
    )
    if (isUndefined(fileBuffer)) {
      return this.response.status(404).json({
        message: "Travel desk travel requests were not found",
      })
    }

    const fileName = this.buildFileName("pdf")

    this.response.setHeader("Content-Type", "application/pdf")
    this.response.setHeader("Content-Disposition", `inline; filename="${fileName}"`)

    return this.response.status(200).send(fileBuffer)
  }

  private buildFileName(format: "csv" | "pdf") {
    const date = DateTime.now().toFormat("yyyy-MM-dd")

    return `Export, Travel Desk Requests, ${date}.${format}`
  }
}

export default TravelDeskTravelRequestsController
