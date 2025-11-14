import { CreationAttributes } from "@sequelize/core"
import { first, isEmpty, isNil, isUndefined, last, sortBy, sumBy } from "lodash"
import { DateTime } from "luxon"

import { TravComIntegration } from "@/integrations"
import { FlightStatistic } from "@/models"
import BaseService from "@/services/base-service"

export const INVOIDE_DETAIL_COST_PRODUCT_CODES = [4, 7, 12]

export class AggregateFlightStatisticService extends BaseService {
  constructor(
    protected accountsReceivableInvoice: TravComIntegration.Models.AccountsReceivableInvoice
  ) {
    super()
  }

  async perform(): Promise<CreationAttributes<FlightStatistic> | null> {
    const { details, segments: unsortedSegments } = this.accountsReceivableInvoice
    if (isUndefined(details)) {
      throw new Error("Expect details association to be preloaded")
    }

    if (isUndefined(unsortedSegments)) {
      throw new Error("Expect segments association to be preloaded")
    }

    const segmentsSorted = sortBy(unsortedSegments, (segment) => segment.departureInfo || "")
    if (isEmpty(segmentsSorted)) return null

    const firstSegment = first(segmentsSorted)
    if (isNil(firstSegment)) return null

    const lastSegment = last(segmentsSorted)
    if (isNil(lastSegment)) return null

    const { departureCityCode, departureInfo: departureDate } = firstSegment
    const { arrivalCityCode, arrivalInfo: arrivalDate } = lastSegment

    if (
      isNil(departureCityCode) ||
      isEmpty(departureCityCode) ||
      isNil(arrivalCityCode) ||
      isEmpty(arrivalCityCode) ||
      isNil(departureDate) ||
      isNil(arrivalDate)
    ) {
      return null
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
      return null
    }

    // TODO: department field contains mail codes, not department names.
    // Multiple mail codes may map to the same department.
    // Update code to map mail codes to department names.
    const { department } = this.accountsReceivableInvoice
    if (isNil(department) || isEmpty(department)) {
      return null
    }

    const totalExpenses = sumBy(details, (detail) => Number(detail.sellingFare))
    const totalFlightCost = sumBy(details, (detail) => {
      if (INVOIDE_DETAIL_COST_PRODUCT_CODES.includes(detail.productCode)) {
        return Number(detail.sellingFare)
      }

      return 0
    })
    const totalDays = this.calculateDays(departureDate, arrivalDate)
    const isRoundTrip = departureCityCode === arrivalCityCode

    let flightStatistic = await FlightStatistic.findOne({
      where: {
        department,
        destinationAirportCode: arrivalCityCode,
        destinationCity: cityName,
        destinationProvince: state,
      },
    })
    if (!isNil(flightStatistic)) {
      flightStatistic.totalDays += totalDays
      flightStatistic.totalExpenses += totalExpenses
      flightStatistic.totalFlightCost += totalFlightCost

      flightStatistic.totalTrips += 1
      flightStatistic.averageDurationDays = flightStatistic.totalDays / flightStatistic.totalTrips
      flightStatistic.averageExpensesPerDay =
        flightStatistic.totalExpenses / flightStatistic.totalDays

      if (isRoundTrip) {
        flightStatistic.totalRoundTrips += 1
        flightStatistic.totalRoundTripCost += totalFlightCost
        flightStatistic.averageRoundTripFlightCost =
          flightStatistic.totalRoundTripCost / flightStatistic.totalRoundTrips
      }

      return flightStatistic.save()
    }

    const totalTrips = 1
    const averageDurationDays = totalDays / totalTrips
    const averageExpensesPerDay = totalExpenses / totalDays

    let totalRoundTrips = 0
    let totalRoundTripCost = 0
    let averageRoundTripFlightCost = 0
    if (isRoundTrip) {
      totalRoundTrips = 1
      totalRoundTripCost = totalFlightCost
      averageRoundTripFlightCost = totalRoundTripCost / totalRoundTrips
    }

    flightStatistic = FlightStatistic.build({
      department,
      destinationAirportCode: arrivalCityCode,
      destinationCity: cityName,
      destinationProvince: state,
      totalExpenses,
      totalFlightCost,
      totalDays,
      totalTrips,
      totalRoundTrips,
      totalRoundTripCost,
      averageDurationDays,
      averageExpensesPerDay,
      averageRoundTripFlightCost,
    })

    return flightStatistic.save()
  }

  private calculateDays(departureDate: Date, arrivalDate: Date): number {
    const start = DateTime.fromJSDate(departureDate)
    const end = DateTime.fromJSDate(arrivalDate)
    if (!start.isValid || !end.isValid) return 0

    const differenceInDays = start.diff(end, "days").days
    const absoluteDifferenceInDays = Math.abs(differenceInDays)
    return Math.ceil(absoluteDifferenceInDays)
  }
}

export default AggregateFlightStatisticService
