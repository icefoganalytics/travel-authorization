import logger from "@/utils/logger"

import { FlightStatisticJob } from "@/models"
import { FlightStatisticsJobsPolicy } from "@/policies"
import { CreateService } from "@/services/flight-statistics-jobs"
import BaseController from "@/controllers/base-controller"

export class FlightStatisticJobsController extends BaseController<FlightStatisticJob> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["updatedAt", "DESC"]])
      const scopedFlightStatisticJobs = FlightStatisticsJobsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedFlightStatisticJobs.count({ where })
      const flightStatisticJobs = await scopedFlightStatisticJobs.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      return this.response.status(200).json({
        flightStatisticJobs,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching flight statistics jobs: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve flight statistics jobs: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create flight statistics jobs.",
        })
      }

      const flightStatisticJob = await CreateService.perform(this.currentUser)
      return this.response.status(201).json({
        flightStatisticJob,
      })
    } catch (error) {
      logger.error(`Error creating flight statistics job: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to create flight statistics job: ${error}`,
      })
    }
  }

  private buildPolicy(flightStatisticJob: FlightStatisticJob = FlightStatisticJob.build()) {
    return new FlightStatisticsJobsPolicy(this.currentUser, flightStatisticJob)
  }
}

export default FlightStatisticJobsController
