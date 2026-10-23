import { DateTime } from "luxon"

import logger from "@/utils/logger"
import { IndexService } from "@/services/travel-desk-travel-requests"
import { CreateCsvService } from "@/services/downloads/travel-desk-travel-requests/create-csv-service"
import { CreatePdfService } from "@/services/downloads/travel-desk-travel-requests/create-pdf-service"
import {
  ReportSerializer,
  type TravelDeskTravelRequestAsReport,
} from "@/serializers/travel-desk-travel-requests/report-serializer"
import BaseController from "@/controllers/base-controller"

const INVALID_SELECTION_MESSAGE = "Invalid travel desk travel request selection"
const NOT_FOUND_MESSAGE = "Travel desk travel requests were not found"
const UNSUPPORTED_FORMAT_MESSAGE = "Unsupported report format"
const DOWNLOAD_FAILURE_MESSAGE = "Failed to create travel desk travel requests download"

export class TravelDeskTravelRequestsController extends BaseController {
  async create() {
    const format = this.query.format
    if (format !== "csv" && format !== "pdf") {
      return this.response.status(422).json({ message: UNSUPPORTED_FORMAT_MESSAGE })
    }

    const requestBody: unknown = this.request.body
    let selectedIdsInput: unknown = undefined
    if (
      typeof requestBody === "object" &&
      requestBody !== null &&
      "travelDeskTravelRequestIds" in requestBody
    ) {
      selectedIdsInput = requestBody.travelDeskTravelRequestIds
    }

    const selectedIds = parseSelectedIds(selectedIdsInput)
    if (selectedIds === null) {
      return this.response.status(422).json({ message: INVALID_SELECTION_MESSAGE })
    }

    try {
      const { travelDeskTravelRequests } = await IndexService.perform(
        { id: selectedIds },
        [],
        [["id", "ASC"]],
        undefined,
        undefined,
        this.currentUser
      )
      const missingSelectedIds = new Set(selectedIds)
      for (const travelDeskTravelRequest of travelDeskTravelRequests) {
        missingSelectedIds.delete(travelDeskTravelRequest.id)
      }

      if (travelDeskTravelRequests.length !== selectedIds.length || missingSelectedIds.size > 0) {
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

function parseSelectedIds(input: unknown): number[] | null {
  let selectedIdsInput = input
  if (typeof selectedIdsInput === "string") {
    try {
      selectedIdsInput = JSON.parse(selectedIdsInput)
    } catch {
      return null
    }
  }

  if (!isSelectedIds(selectedIdsInput)) return null

  return selectedIdsInput
}

function isSelectedIds(input: unknown): input is number[] {
  return (
    Array.isArray(input) &&
    input.length > 0 &&
    input.every(
      (selectedId: unknown) =>
        typeof selectedId === "number" && Number.isSafeInteger(selectedId) && selectedId > 0
    ) &&
    new Set(input).size === input.length
  )
}

export default TravelDeskTravelRequestsController
