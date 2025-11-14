import { isNil } from "lodash"

import logger from "@/utils/logger"

import { FlightStatistic } from "@/models"
import { FlightStatisticsPolicy } from "@/policies"
import { IndexSerializer, ShowSerializer } from "@/serializers/flight-statistics"
import BaseController from "@/controllers/base-controller"

export class FlightStatisticsController extends BaseController<FlightStatistic> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["department", "ASC"],
        ["destinationCity", "ASC"],
      ])
      const scopedFlightStatistics = FlightStatisticsPolicy.applyScope(scopes, this.currentUser)
      const totalCount = await scopedFlightStatistics.count({ where })
      const flightStatistics = await scopedFlightStatistics.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedFlightStatistics = IndexSerializer.perform(flightStatistics, this.currentUser)
      return this.response.json({
        flightStatistics: serializedFlightStatistics,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching flight statistics: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve flight statistics: ${error}`,
      })
    }
  }

  async show() {
    try {
      const flightStatistic = await this.loadFlightStatistic()
      if (isNil(flightStatistic)) {
        return this.response.status(404).json({
          message: "Flight statistic not found.",
        })
      }

      const policy = this.buildPolicy(flightStatistic)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this flight statistic.",
        })
      }

      const serializedFlightStatistic = ShowSerializer.perform(flightStatistic, this.currentUser)
      return this.response.status(200).json({
        flightStatistic: serializedFlightStatistic,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching flight statistic: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve flight statistic: ${error}`,
      })
    }
  }

  private loadFlightStatistic() {
    return FlightStatistic.findByPk(this.params.flightStatisticId)
  }

  private buildPolicy(flightStatistic: FlightStatistic) {
    return new FlightStatisticsPolicy(this.currentUser, flightStatistic)
  }
}

export default FlightStatisticsController
