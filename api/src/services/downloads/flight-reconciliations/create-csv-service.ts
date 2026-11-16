import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { writeToBuffer } from "fast-csv"

import { type ModelOrder } from "@/controllers/base-controller"
import { type FlightReconciliation } from "@/models"
import {
  FlightReconciliationReportHeaders,
  ReportSerializer,
} from "@/serializers/flight-reconciliations/report-serializer"
import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedFlightReconciliations: ModelStatic<FlightReconciliation>,
    private where: WhereOptions<Attributes<FlightReconciliation>>,
    private order: ModelOrder[] | undefined
  ) {
    super()
  }

  async perform(): Promise<Buffer> {
    const flightReconciliations = await this.scopedFlightReconciliations.findAll({
      where: this.where,
      order: this.order,
    })
    const serializedFlightReconciliations = ReportSerializer.perform(flightReconciliations)
    const headers = Object.values(FlightReconciliationReportHeaders)
    const csvRows: (string[] | Record<string, string | number>)[] = [headers]
    for (const row of serializedFlightReconciliations) {
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
