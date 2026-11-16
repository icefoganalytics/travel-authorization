import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { writeToBuffer } from "fast-csv"

import { type ModelOrder } from "@/controllers/base-controller"
import { type FlightStatistic } from "@/models"
import {
  FlightStatisticReportHeaders,
  ReportSerializer,
} from "@/serializers/flight-statistics/report-serializer"
import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedFlightStatistics: ModelStatic<FlightStatistic>,
    private where: WhereOptions<Attributes<FlightStatistic>>,
    private order: ModelOrder[] | undefined
  ) {
    super()
  }

  async perform(): Promise<Buffer> {
    const flightStatistics = await this.scopedFlightStatistics.findAll({
      where: this.where,
      order: this.order,
    })
    const serializedFlightStatistics = ReportSerializer.perform(flightStatistics)
    const headers = Object.values(FlightStatisticReportHeaders)
    const csvRows: (string[] | Record<string, string | number>)[] = [headers]
    for (const row of serializedFlightStatistics) {
      const safeRow = Object.fromEntries(
        Object.entries(row).map(([header, value]) => {
          const safeValue = typeof value === "string" ? neutralizeSpreadsheetFormula(value) : value

          return [header, safeValue]
        })
      )
      csvRows.push(safeRow)
    }

    return writeToBuffer(csvRows, {
      headers: true,
      includeEndRowDelimiter: true,
      rowDelimiter: "\r\n",
      writeBOM: true,
    })
  }
}

export default CreateCsvService
