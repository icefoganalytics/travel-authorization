import { type Writable } from "node:stream"

import { type Attributes, type WhereOptions } from "@sequelize/core"

import withAbortableReadTransaction from "@/db/utils/with-abortable-read-transaction"

import CsvStreamingClient from "@/lib/csv-streaming-client"

import { type ModelOrder } from "@/controllers/base-controller"
import { type FlightReconciliation } from "@/models"
import { type FlightReconciliationsPolicy } from "@/policies"
import {
  FLIGHT_RECONCILIATION_REPORT_HEADERS,
  ReportSerializer,
} from "@/serializers/flight-reconciliations/report-serializer"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private outputStream: Writable,
    private scopedFlightReconciliations: ReturnType<typeof FlightReconciliationsPolicy.applyScope>,
    private where: WhereOptions<Attributes<FlightReconciliation>>,
    private order: ModelOrder[] | undefined
  ) {
    super()
  }

  async perform(): Promise<void> {
    return CsvStreamingClient.stream(
      this.outputStream,
      FLIGHT_RECONCILIATION_REPORT_HEADERS,
      (writeRow, signal) => {
        return withAbortableReadTransaction(signal, async () => {
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
