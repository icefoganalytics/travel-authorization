import { DateTime } from "luxon"
import { isEmpty } from "lodash"

import logger from "@/utils/logger"
import { type TravelDeskTravelRequest } from "@/models"
import { IndexService } from "@/services/travel-desk-travel-requests"
import { CreateCsvService } from "@/services/downloads/travel-desk-travel-requests/create-csv-service"
import { CreatePdfService } from "@/services/downloads/travel-desk-travel-requests/create-pdf-service"
import {
  ReportSerializer,
  type TravelDeskTravelRequestAsReport,
} from "@/serializers/travel-desk-travel-requests/report-serializer"
import BaseController from "@/controllers/base-controller"

const NOT_FOUND_MESSAGE = "Travel desk travel requests were not found"
const UNSUPPORTED_FORMAT_MESSAGE = "Unsupported report format"
const DOWNLOAD_FAILURE_MESSAGE = "Failed to create travel desk travel requests download"

export class TravelDeskTravelRequestsController extends BaseController<TravelDeskTravelRequest> {
  async create() {
    const format = this.query.format
    if (format !== "csv" && format !== "pdf") {
      return this.response.status(422).json({ message: UNSUPPORTED_FORMAT_MESSAGE })
    }

    try {
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
      if (isEmpty(travelDeskTravelRequests)) {
        return this.response.status(404).json({ message: NOT_FOUND_MESSAGE })
      }

      const reportRows = ReportSerializer.perform(travelDeskTravelRequests, this.currentUser)
      if (format === "csv") {
        return await this.respondWithCsv(reportRows)
      } else {
        return await this.respondWithPdf(reportRows)
      }
    } catch (error) {
      logger.error(`${DOWNLOAD_FAILURE_MESSAGE}: ${error}`, { error })
      return this.response.status(422).json({ message: DOWNLOAD_FAILURE_MESSAGE })
    }
  }

  private async respondWithCsv(rows: TravelDeskTravelRequestAsReport[]) {
    const fileBuffer = await CreateCsvService.perform(rows)
    const date = DateTime.now().toFormat("yyyy-LL-dd")
    const fileName = `Export, Travel Desk Requests, ${date}.csv`

    this.response.attachment(fileName)
    this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return this.response.status(200).send(fileBuffer)
  }

  private async respondWithPdf(rows: TravelDeskTravelRequestAsReport[]) {
    const fileBuffer = await CreatePdfService.perform(rows)
    const date = DateTime.now().toFormat("yyyy-LL-dd")
    const fileName = `Travel Desk Report, ${date}.pdf`

    this.response.setHeader("Content-Type", "application/pdf")
    this.response.setHeader("Content-Disposition", `inline; filename="${fileName}"`)

    return this.response.status(200).send(fileBuffer)
  }
}

export default TravelDeskTravelRequestsController
