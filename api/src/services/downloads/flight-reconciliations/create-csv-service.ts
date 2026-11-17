import { type Writable } from "node:stream"

import { IsolationLevel, type Attributes, type WhereOptions } from "@sequelize/core"

import csvStreamingClient from "@/lib/csv-streaming-client"
import { type ModelOrder } from "@/controllers/base-controller"
import db, { type FlightReconciliation } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
import {
  FlightReconciliationReportHeaders,
  ReportSerializer,
} from "@/serializers/flight-reconciliations/report-serializer"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedFlightReconciliations: BaseModelConstructor<FlightReconciliation>,
    private where: WhereOptions<Attributes<FlightReconciliation>>,
    private order: ModelOrder[] | undefined,
    private outputStream: Writable
  ) {
    super()
  }

  async perform(): Promise<void> {
    const headers = Object.values(FlightReconciliationReportHeaders)

    return csvStreamingClient.stream(this.outputStream, headers, async (writeRow) => {
      await db.transaction(
        {
          isolationLevel: IsolationLevel.REPEATABLE_READ,
          readOnly: true,
        },
        async (transaction) => {
          await this.scopedFlightReconciliations.findEach(
            {
              where: this.where,
              order: this.order,
              transaction,
            },
            async (record) => {
              const row = ReportSerializer.perform(record)
              await writeRow(row)
            }
          )
        }
      )
    })
  }
}

export default CreateCsvService
