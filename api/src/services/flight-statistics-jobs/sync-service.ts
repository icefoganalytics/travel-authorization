import { CreationAttributes } from "@sequelize/core"
import isEmpty, { cloneDeep, first, isNil, isUndefined, last, sumBy } from "lodash"

import logger from "@/utils/logger"

import { airports } from "@/json/airportCodes"

import { TravComIntegration } from "@/integrations"

import { FlightStatistic, FlightStatisticJob, Location } from "@/models"
import BaseService from "@/services/base-service"

export class SyncService extends BaseService {
  private static readonly PROGRESS_UPDATE_INTERVAL = 300

  constructor(protected job: FlightStatisticJob) {
    super()
  }

  async perform(): Promise<void> {
    const totalInvoices = await TravComIntegration.Models.AccountsReceivableInvoice.count()
    logger.info(`Processing ${totalInvoices} invoices`)

    let numberOfInvoicesProcessed = 0
    let flightStatisticsAttributes: Record<string, CreationAttributes<FlightStatistic>> = {}

    await TravComIntegration.Models.AccountsReceivableInvoice.findEach(
      {
        include: ["details", "segments"],
      },
      async (invoice: TravComIntegration.Models.AccountsReceivableInvoice) => {
        flightStatisticsAttributes = await this.processInvoice(invoice, flightStatisticsAttributes)
        numberOfInvoicesProcessed = await this.updateJobProgress(
          numberOfInvoicesProcessed,
          totalInvoices
        )
      }
    )

    await this.bulkReplaceFlightStatistics(flightStatisticsAttributes)
  }

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

    const departureCityCode = firstSegment.departureCityCode
    const arrivalCityCode = lastSegment.arrivalCityCode
    const departureDate = firstSegment.departureInfo
    const arrivalDate = lastSegment.arrivalInfo

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

    const totalExpenses = sumBy(details, (detail) => Number(detail.sellingFare))

    const totalFlightCost = sumBy(details, (detail) => {
      if (detail.productCode === 4 || detail.productCode === 7 || detail.productCode === 12) {
        return Number(detail.sellingFare)
      }
      return 0
    })

    const statisticsClone = cloneDeep(flightStatisticsAttributes)
    const department = invoice.department || "Unknown"
    const statisticsKey = `${department}/${arrivalCityCode}`

    if (!statisticsClone[statisticsKey]) {
      const flightStatisticAttributes: CreationAttributes<FlightStatistic> = {
        department,
        destinationAirportCode: arrivalCityCode,
        destinationCity: "",
        destinationProvince: "",
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

    statisticsClone[statisticsKey].totalExpenses += totalExpenses
    statisticsClone[statisticsKey].totalFlightCost += totalFlightCost

    const days = this.calculateDays(departureDate, arrivalDate)
    statisticsClone[statisticsKey].totalDays += days

    statisticsClone[statisticsKey].totalTrips += 1

    const isRoundTrip = departureCityCode === arrivalCityCode
    if (isRoundTrip) {
      statisticsClone[statisticsKey].totalRoundTrips += 1
      statisticsClone[statisticsKey].totalRoundTripCost += totalFlightCost
    }

    return statisticsClone
  }

  private async bulkReplaceFlightStatistics(
    flightStatisticsAttributes: Record<string, CreationAttributes<FlightStatistic>>
  ): Promise<void> {
    await FlightStatistic.destroy({ where: {} })

    const locations = await Location.findAll({ attributes: ["province", "city"] })

    for (const key of Object.keys(flightStatisticsAttributes)) {
      const record = flightStatisticsAttributes[key]

      const matchingAirport = airports.find(
        (airport) => airport.iata_code === record.destinationAirportCode
      )
      const destinationCity = matchingAirport?.municipality || ""

      const matchingLocation = locations.find(
        (location) => location.city.toLowerCase().trim() === destinationCity.toLowerCase().trim()
      )
      const destinationProvince = matchingLocation?.province || matchingAirport?.iso_country || ""

      const averageDurationDays = record.totalDays / record.totalTrips
      const averageExpensesPerDay = record.totalExpenses / record.totalDays
      const averageRoundTripFlightCost = record.totalRoundTripCost / (record.totalRoundTrips || 1)

      try {
        await FlightStatistic.create({
          department: record.department,
          destinationAirportCode: record.destinationAirportCode,
          destinationCity,
          destinationProvince,
          totalTrips: record.totalTrips,
          totalRoundTrips: record.totalRoundTrips,
          totalDays: record.totalDays,
          totalExpenses: record.totalExpenses,
          totalFlightCost: record.totalFlightCost,
          totalRoundTripCost: record.totalRoundTripCost,
          averageDurationDays,
          averageExpensesPerDay,
          averageRoundTripFlightCost,
        })
      } catch (error) {
        logger.info("Failed to create flight statistic record", { error, record })
      }
    }

    try {
      await this.job.update({ progress: 100 })
    } catch (error) {
      logger.info("Failed to update job progress to 100%", { error })
    }
  }

  private calculateDays(departureDate: string, lastLegDate: string): number {
    const start = new Date(departureDate)
    const end = new Date(lastLegDate)
    const differenceTimeMilliseconds = Math.abs(end.getTime() - start.getTime())
    const differenceDays = Math.ceil(differenceTimeMilliseconds / (1000 * 60 * 60 * 24))
    return differenceDays
  }

  private async updateJobProgress(
    numberOfInvoicesProcessed: number,
    totalInvoices: number
  ): Promise<number> {
    if (numberOfInvoicesProcessed % SyncService.PROGRESS_UPDATE_INTERVAL === 0) {
      const progress = Math.floor((100 * numberOfInvoicesProcessed) / totalInvoices)
      logger.info(`${numberOfInvoicesProcessed} => ${progress}%`)

      try {
        await this.job.update({ progress })
      } catch (error) {
        logger.info("Failed to update job progress", { error })
      }
    }

    return numberOfInvoicesProcessed + 1
  }
}

export default SyncService
