import { type Writable } from "node:stream"

import { type Attributes, type WhereOptions } from "@sequelize/core"

import csvStreamingClient from "@/lib/csv-streaming-client"
import { type ModelOrder } from "@/controllers/base-controller"
import { type FlightReconciliation } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
import {
  FLIGHT_RECONCILIATION_REPORT_HEADERS,
  ReportSerializer,
} from "@/serializers/flight-reconciliations/report-serializer"
import BaseService from "@/services/base-service"
import withReportTransaction from "@/services/downloads/with-report-transaction"

export class CreateCsvService extends BaseService {
  constructor(
    private outputStream: Writable,
    private scopedFlightReconciliations: BaseModelConstructor<FlightReconciliation>,
    private where: WhereOptions<Attributes<FlightReconciliation>>,
    private order: ModelOrder[] | undefined
  ) {
    super()
  }

  async perform(): Promise<void> {
    return csvStreamingClient.stream(
      this.outputStream,
      FLIGHT_RECONCILIATION_REPORT_HEADERS,
      (writeRow, signal) => {
        return withReportTransaction(signal, async () => {
          await this.scopedFlightReconciliations.findEach(
            {
              where: this.where,
              order: this.order,
            },
            async (record) => {
              const row = ReportSerializer.perform(record)
              await writeRow(row)
            }
          )
        })
      }
    )
  }
}

export default CreateCsvService
