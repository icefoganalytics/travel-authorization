import { DateTime } from "luxon"
import { isEmpty } from "lodash"

import logger from "@/utils/logger"
import { type TravelDeskTravelRequest } from "@/models"
import { IndexService } from "@/services/travel-desk-travel-requests"
import { CreateCsvService } from "@/services/downloads/travel-desk-travel-requests/create-csv-service"
import { CreatePdfService } from "@/services/downloads/travel-desk-travel-requests/create-pdf-service"
import { ReportSerializer } from "@/serializers/travel-desk-travel-requests"
import BaseController from "@/controllers/base-controller"

export class TravelDeskTravelRequestsController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    try {
      if (this.query.format === "csv") {
        return await this.respondWithCsv()
      } else if (this.query.format === "pdf") {
        return await this.respondWithPdf()
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

  private async loadSerializedTravelDeskTravelRequests() {
    const where = this.buildWhere()
    const scopes = this.buildFilterScopes()
    const order = this.buildOrder([["id", "ASC"]])

    // Reports include all matches rather than only the current list page.
    const { travelDeskTravelRequests } = await IndexService.perform(
      where,
      scopes,
      order,
      undefined,
      undefined,
      this.currentUser
    )
    const serializedTravelDeskTravelRequests = ReportSerializer.perform(
      travelDeskTravelRequests,
      this.currentUser
    )

    return serializedTravelDeskTravelRequests
  }

  private async respondWithCsv() {
    const serializedTravelDeskTravelRequests = await this.loadSerializedTravelDeskTravelRequests()
    if (isEmpty(serializedTravelDeskTravelRequests)) {
      return this.response.status(404).json({
        message: "Travel desk travel requests were not found",
      })
    }

    const fileBuffer = await CreateCsvService.perform(serializedTravelDeskTravelRequests)
    const fileName = this.buildFileName("csv")

    this.response.attachment(fileName)
    this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return this.response.status(200).send(fileBuffer)
  }

  private async respondWithPdf() {
    const serializedTravelDeskTravelRequests = await this.loadSerializedTravelDeskTravelRequests()
    if (isEmpty(serializedTravelDeskTravelRequests)) {
      return this.response.status(404).json({
        message: "Travel desk travel requests were not found",
      })
    }

    const fileBuffer = await CreatePdfService.perform(serializedTravelDeskTravelRequests)
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
