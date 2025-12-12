import logger from "@/utils/logger"

import { TravComIntegration } from "@/integrations"

import db, { FlightStatistic, FlightStatisticJob } from "@/models"
import BaseService from "@/services/base-service"
import AggregateFlightStatisticService from "@/services/flight-statistics-jobs/aggregate-flight-statistic-service"

export class SyncService extends BaseService {
  private static readonly PROGRESS_UPDATE_INTERVAL = 300

  constructor(protected flightStatisticsJob: FlightStatisticJob) {
    super()
  }

  async perform(): Promise<void> {
    await db.transaction(async () => {
      const totalInvoices = await TravComIntegration.Models.AccountsReceivableInvoice.count()
      logger.info(
        `FlightStatisticsJob#${this.flightStatisticsJobId}: processing ${totalInvoices} invoices`
      )

      await FlightStatistic.destroy({ where: {} })

      let numberOfInvoicesProcessed = 0

      await TravComIntegration.Models.AccountsReceivableInvoice.findEach(
        {
          include: [
            "details",
            {
              association: "segments",
              include: ["arrivalCity"],
            },
          ],
        },
        async (accountsReceivableInvoice: TravComIntegration.Models.AccountsReceivableInvoice) => {
          await AggregateFlightStatisticService.perform(accountsReceivableInvoice)

          numberOfInvoicesProcessed = await this.updateJobProgress(
            numberOfInvoicesProcessed,
            totalInvoices
          )
        }
      )
    })

    await this.flightStatisticsJob.update(
      {
        progress: 100,
      },
      {
        transaction: null,
      }
    )
  }

  private async updateJobProgress(
    numberOfInvoicesProcessed: number,
    totalInvoices: number
  ): Promise<number> {
    if (numberOfInvoicesProcessed % SyncService.PROGRESS_UPDATE_INTERVAL === 0) {
      const progress = Math.floor((100 * numberOfInvoicesProcessed) / totalInvoices)
      logger.info(
        `FlightStatisticsJob#${this.flightStatisticsJobId}: processed ${numberOfInvoicesProcessed} of ${totalInvoices} invoices (${progress}% complete)`
      )

      await this.flightStatisticsJob.update(
        {
          progress,
        },
        {
          transaction: null,
        }
      )
    }

    return numberOfInvoicesProcessed + 1
  }

  get flightStatisticsJobId(): number {
    return this.flightStatisticsJob.id
  }
}

export default SyncService
