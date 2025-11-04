import { CreationAttributes } from "@sequelize/core"
import isEmpty, { cloneDeep, first, has, isNil, isUndefined, last, sumBy } from "lodash"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { TravComIntegration } from "@/integrations"

import { FlightStatistic, FlightStatisticJob } from "@/models"
import BaseService from "@/services/base-service"

export class SyncService extends BaseService {
  private static readonly PROGRESS_UPDATE_INTERVAL = 300

  constructor(protected flightStatisticsJob: FlightStatisticJob) {
    super()
  }

  async perform(): Promise<void> {
    const totalInvoices = await TravComIntegration.Models.AccountsReceivableInvoice.count()
    logger.info(
      `FlightStatisticsJob#${this.flightStatisticsJobId}: processing ${totalInvoices} invoices`
    )

    let numberOfInvoicesProcessed = 0
    let flightStatisticsAttributesMap: Record<string, CreationAttributes<FlightStatistic>> = {}

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
      async (invoice: TravComIntegration.Models.AccountsReceivableInvoice) => {
        flightStatisticsAttributesMap = await this.processInvoice(
          invoice,
          flightStatisticsAttributesMap
        )
        numberOfInvoicesProcessed = await this.updateJobProgress(
          numberOfInvoicesProcessed,
          totalInvoices
        )
      }
    )

    const flightStatisticsAttributes = Object.values(flightStatisticsAttributesMap)
    await this.bulkReplaceFlightStatistics(flightStatisticsAttributes)
    await this.flightStatisticsJob.update({ progress: 100 })
  }

  // TODO: see if I can break the process invoice method out into it's own job.
  private async processInvoice(
    invoice: TravComIntegration.Models.AccountsReceivableInvoice,
    flightStatisticsAttributes: Record<string, CreationAttributes<FlightStatistic>>
  ): Promise<Record<string, CreationAttributes<FlightStatistic>>> {
    const { details, segments: unsortedSegments } = invoice
    if (isUndefined(details)) {
      throw new Error("Expect details association to be preloaded")
    }

    if (isUndefined(unsortedSegments)) {
      throw new Error("Expect segments association to be preloaded")
    }

    const segmentsSorted = unsortedSegments.sort((segmentA, segmentB) => {
      const departureInfoA = segmentA.departureInfo || ""
      const departureInfoB = segmentB.departureInfo || ""
      return departureInfoA >= departureInfoB ? 1 : -1
    })
    if (isEmpty(segmentsSorted)) return cloneDeep(flightStatisticsAttributes)

    const firstSegment = first(segmentsSorted)
    if (isNil(firstSegment)) return cloneDeep(flightStatisticsAttributes)

    const lastSegment = last(segmentsSorted)
    if (isNil(lastSegment)) return cloneDeep(flightStatisticsAttributes)

    const { departureCityCode, departureInfo: departureDate } = firstSegment
    const { arrivalCityCode, arrivalInfo: arrivalDate } = lastSegment

    if (
      isNil(departureCityCode) ||
      isEmpty(departureCityCode) ||
      isNil(arrivalCityCode) ||
      isEmpty(arrivalCityCode) ||
      isNil(departureDate) ||
      isEmpty(departureDate) ||
      isNil(arrivalDate) ||
      isEmpty(arrivalDate)
    ) {
      return cloneDeep(flightStatisticsAttributes)
    }

    const { arrivalCity } = lastSegment
    if (isUndefined(arrivalCity)) {
      throw new Error("Expect arrivalCity association to be preloaded")
    }

    const { cityName, state } = arrivalCity
    if (
      isNil(arrivalCity) ||
      isNil(cityName) ||
      isEmpty(cityName) ||
      isNil(state) ||
      isEmpty(state)
    ) {
      return cloneDeep(flightStatisticsAttributes)
    }

    const totalExpenses = sumBy(details, (detail) => Number(detail.sellingFare))

    const totalFlightCost = sumBy(details, (detail) => {
      if (detail.productCode === 4 || detail.productCode === 7 || detail.productCode === 12) {
        return Number(detail.sellingFare)
      }
      return 0
    })

    // TODO: department is actually mail code.
    // Update code so that it converts mail code to department.
    const { department } = invoice
    if (isNil(department) || isEmpty(department)) {
      return cloneDeep(flightStatisticsAttributes)
    }

    const statisticsClone = cloneDeep(flightStatisticsAttributes)
    const statisticsKey = `${department}/${arrivalCityCode}`

    if (!has(statisticsClone, statisticsKey)) {
      const flightStatisticAttributes: CreationAttributes<FlightStatistic> = {
        department,
        destinationAirportCode: arrivalCityCode,
        destinationCity: cityName,
        destinationProvince: state,
        totalExpenses: 0,
        totalFlightCost: 0,
        totalDays: 0,
        totalTrips: 0,
        totalRoundTrips: 0,
        totalRoundTripCost: 0,
        averageDurationDays: 0,
        averageExpensesPerDay: 0,
        averageRoundTripFlightCost: 0,
      }
      statisticsClone[statisticsKey] = flightStatisticAttributes
    }

    const statisticAttributes = statisticsClone[statisticsKey]
    statisticAttributes.totalExpenses += totalExpenses
    statisticAttributes.totalFlightCost += totalFlightCost

    const days = this.calculateDays(departureDate, arrivalDate)
    statisticAttributes.totalDays += days
    statisticAttributes.averageExpensesPerDay =
      statisticAttributes.totalExpenses / statisticAttributes.totalDays

    statisticAttributes.totalTrips += 1
    statisticAttributes.averageDurationDays =
      statisticAttributes.totalDays / statisticAttributes.totalTrips

    const isRoundTrip = departureCityCode === arrivalCityCode
    if (isRoundTrip) {
      statisticAttributes.totalRoundTrips += 1
      statisticAttributes.totalRoundTripCost += totalFlightCost
      statisticAttributes.averageRoundTripFlightCost =
        statisticAttributes.totalRoundTripCost / statisticAttributes.totalRoundTrips
    }

    return statisticsClone
  }

  private async bulkReplaceFlightStatistics(
    flightStatisticsAttributes: CreationAttributes<FlightStatistic>[]
  ): Promise<void> {
    await FlightStatistic.destroy({ where: {} })
    await FlightStatistic.bulkCreateBatched(flightStatisticsAttributes)
  }

  private calculateDays(departureDate: string, lastLegDate: string): number {
    const startDate = DateTime.fromISO(departureDate)
    const endDate = DateTime.fromISO(lastLegDate)

    if (!startDate.isValid || !endDate.isValid) {
      return 0
    }

    const differenceDays = Math.ceil(Math.abs(endDate.diff(startDate).as("days")))

    return differenceDays
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

      await this.flightStatisticsJob.update({ progress })
    }

    return numberOfInvoicesProcessed + 1
  }

  get flightStatisticsJobId(): number {
    return this.flightStatisticsJob.id
  }
}

export default SyncService
