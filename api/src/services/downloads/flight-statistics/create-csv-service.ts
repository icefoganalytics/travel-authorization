import { type Writable } from "node:stream"

import { type Attributes, type WhereOptions } from "@sequelize/core"

import CsvStreamingClient from "@/lib/csv-streaming-client"

import { type ModelOrder } from "@/controllers/base-controller"
import { type FlightStatistic } from "@/models"
import { type FlightStatisticsPolicy } from "@/policies"
import {
  FLIGHT_STATISTIC_REPORT_HEADERS,
  ReportSerializer,
} from "@/serializers/flight-statistics/report-serializer"
import BaseService from "@/services/base-service"
import { Downloads } from "@/services"

export class CreateCsvService extends BaseService {
  constructor(
    private outputStream: Writable,
    private scopedFlightStatistics: ReturnType<typeof FlightStatisticsPolicy.applyScope>,
    private where: WhereOptions<Attributes<FlightStatistic>>,
    private order: ModelOrder[] | undefined
  ) {
    super()
  }

  async perform(): Promise<void> {
    return CsvStreamingClient.stream(
      this.outputStream,
      FLIGHT_STATISTIC_REPORT_HEADERS,
      (writeRow, signal) => {
        return Downloads.WithReportTransaction.perform(signal, async () => {
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
        })
      }
    )
  }
}

export default CreateCsvService
