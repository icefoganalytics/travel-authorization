import { writeToBuffer } from "fast-csv"

import {
  TravelDeskTravelRequestReportHeaders,
  type TravelDeskTravelRequestAsReport,
} from "@/serializers/travel-desk-travel-requests/report-serializer"
import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(private rows: TravelDeskTravelRequestAsReport[]) {
    super()
  }

  async perform(): Promise<Buffer> {
    const csvRows = this.rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([header, value]) => [header, neutralizeSpreadsheetFormula(value)])
      )
    )

    return writeToBuffer(csvRows, {
      alwaysWriteHeaders: true,
      headers: Object.values(TravelDeskTravelRequestReportHeaders),
      includeEndRowDelimiter: true,
      rowDelimiter: "\r\n",
      writeBOM: true,
    })
  }
}

export default CreateCsvService
