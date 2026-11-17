import { type Writable } from "node:stream"

import { IsolationLevel, type Attributes, type WhereOptions } from "@sequelize/core"

import csvStreamingClient from "@/lib/csv-streaming-client"
import { type ModelOrder } from "@/controllers/base-controller"
import db, { type FlightStatistic } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
import {
  CSV_HEADERS,
  ReportSerializer,
} from "@/serializers/flight-statistics/report-serializer"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private outputStream: Writable,
    private scopedFlightStatistics: BaseModelConstructor<FlightStatistic>,
    private where: WhereOptions<Attributes<FlightStatistic>>,
    private order: ModelOrder[] | undefined
  ) {
    super()
  }

  async perform(): Promise<void> {
    return csvStreamingClient.stream(this.outputStream, CSV_HEADERS, async (writeRow) => {
      await db.transaction(
        {
          isolationLevel: IsolationLevel.REPEATABLE_READ,
          readOnly: true,
        },
        async () => {
          await this.scopedFlightStatistics.findEach(
            {
              where: this.where,
              order: this.order,
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
