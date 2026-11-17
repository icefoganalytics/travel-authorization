import { type Writable } from "node:stream"

import { IsolationLevel, type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"

import { type ModelOrder } from "@/controllers/base-controller"
import db, { type FlightReconciliation } from "@/models"
import BaseModel from "@/models/base-model"
import {
  FlightReconciliationReportHeaders,
  ReportSerializer,
} from "@/serializers/flight-reconciliations/report-serializer"
import streamCsv from "@/utils/stream-csv"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedFlightReconciliations: ModelStatic<FlightReconciliation>,
    private where: WhereOptions<Attributes<FlightReconciliation>>,
    private order: ModelOrder[] | undefined,
    private destination: Writable
  ) {
    super()
  }

  async perform(): Promise<void> {
    const headers = Object.values(FlightReconciliationReportHeaders)

    return streamCsv(this.destination, headers, async (writeRow) => {
      await db.transaction(
        {
          isolationLevel: IsolationLevel.REPEATABLE_READ,
          readOnly: true,
        },
        async (transaction) => {
          await (BaseModel.findEach<FlightReconciliation>).call(
            this.scopedFlightReconciliations,
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
