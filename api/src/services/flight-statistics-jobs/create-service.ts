import { Op } from "@sequelize/core"

import logger from "@/utils/logger"

import { FlightStatisticJob, User } from "@/models"
import BaseService from "@/services/base-service"
import SyncService from "@/services/flight-statistics-jobs/sync-service"

export class CreateService extends BaseService {
  constructor(protected currentUser: User) {
    super()
  }

  async perform(): Promise<FlightStatisticJob> {
    if (await this.jobAlreadyInProgress()) {
      throw new Error(
        "A flight statistics sync job is already in progress. Please wait for it to complete before starting a new sync."
      )
    }

    const job = await FlightStatisticJob.create({
      progress: 0,
    })

    // TODO: pull in background job architecture and use that instead
    this.performSyncInBackground(job)

    return job
  }

  private async jobAlreadyInProgress(): Promise<boolean> {
    const inProgressJobsCount = await FlightStatisticJob.count({
      where: {
        progress: {
          [Op.lt]: 100,
        },
      },
    })
    return inProgressJobsCount > 0
  }

  private async performSyncInBackground(job: FlightStatisticJob): Promise<void> {
    let failed = false
    try {
      await SyncService.perform(job)
    } catch (error) {
      logger.error("Failed to sync flight statistics", { error })
      failed = true
    } finally {
      await job.update({ progress: 100, failed })
    }
  }
}

export default CreateService
