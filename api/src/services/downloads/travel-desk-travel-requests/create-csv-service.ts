import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { isEmpty } from "lodash"
import { writeToBuffer } from "fast-csv"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelDeskTravelRequest, type User } from "@/models"
import { TravelDeskTravelRequestReportHeaders } from "@/serializers/travel-desk-travel-requests"
import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"
import BaseService from "@/services/base-service"
import { IndexService } from "@/services/downloads/travel-desk-travel-requests/index-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedTravelDeskTravelRequests: ModelStatic<TravelDeskTravelRequest>,
    private where: WhereOptions<Attributes<TravelDeskTravelRequest>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Buffer> {
    const serializedTravelDeskTravelRequests = await IndexService.perform(
      this.scopedTravelDeskTravelRequests,
      this.where,
      this.order,
      this.currentUser
    )
    if (isEmpty(serializedTravelDeskTravelRequests)) {
      throw new Error("Travel desk travel requests were not found")
    }

    const csvRows = serializedTravelDeskTravelRequests.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([header, value]) => [header, neutralizeSpreadsheetFormula(value)])
      )
    )

    const headers = Object.values(TravelDeskTravelRequestReportHeaders)

    return writeToBuffer(csvRows, {
      alwaysWriteHeaders: true,
      headers,
      includeEndRowDelimiter: true,
      rowDelimiter: "\r\n",
      writeBOM: true,
    })
  }
}

export default CreateCsvService
