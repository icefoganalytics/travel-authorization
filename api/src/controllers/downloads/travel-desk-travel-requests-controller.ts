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
      const fileBuffer = await this.createFile(format, reportRows)
      const date = DateTime.now().toFormat("yyyy-LL-dd")

      if (format === "csv") {
        this.response.setHeader("Content-Type", "text/csv; charset=utf-8")
        this.response.setHeader(
          "Content-Disposition",
          `attachment; filename="Export, Travel Desk Requests, ${date}.csv"`
        )
      } else {
        this.response.setHeader("Content-Type", "application/pdf")
        this.response.setHeader(
          "Content-Disposition",
          `inline; filename="Travel Desk Report, ${date}.pdf"`
        )
      }

      return this.response.status(200).send(fileBuffer)
    } catch (error) {
      logger.error(`${DOWNLOAD_FAILURE_MESSAGE}: ${error}`, { error })
      return this.response.status(422).json({ message: DOWNLOAD_FAILURE_MESSAGE })
    }
  }

  private createFile(
    format: "csv" | "pdf",
    rows: TravelDeskTravelRequestAsReport[]
  ): Promise<Buffer> {
    if (format === "csv") {
      return CreateCsvService.perform(rows)
    }

    return CreatePdfService.perform(rows)
  }
}

export default TravelDeskTravelRequestsController
