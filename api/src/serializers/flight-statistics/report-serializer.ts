import { isNil } from "lodash"

import { type FlightStatistic } from "@/models"
import formatCurrency from "@/utils/format-currency"
import BaseSerializer from "@/serializers/base-serializer"

export enum FlightStatisticReportHeaders {
  DEPARTMENT_MAILCODE = "Department Mailcode",
  FINAL_DESTINATION_CITY = "Final Destination City",
  FINAL_DESTINATION_PROVINCE = "Final Destination Province",
  TOTAL_TRIPS = "Total Trips",
  TOTAL_EXPENSES = "Total Expenses",
  TOTAL_FLIGHT_COST = "Total Flight Cost",
  AVERAGE_DURATION_DAYS = "Average Duration (days)",
  AVERAGE_EXPENSES_PER_DAY = "Average Expenses per Day",
  AVERAGE_ROUND_TRIP_FLIGHT_COST = "Average Round Trip Flight Cost",
}

export const FLIGHT_STATISTIC_REPORT_HEADERS = Object.values(FlightStatisticReportHeaders)

export type FlightStatisticAsReport = Record<FlightStatisticReportHeaders, string | number>

export class ReportSerializer extends BaseSerializer<FlightStatistic> {
  perform(): FlightStatisticAsReport {
    const {
      departmentMailcode,
      destinationCity,
      destinationProvince,
      totalTrips,
      totalExpenses,
      totalFlightCost,
      averageDurationDays,
      averageExpensesPerDay,
      averageRoundTripFlightCost,
    } = this.record

    const formattedDepartmentMailcode = this.formatDepartmentMailcode(departmentMailcode)
    const formattedFinalDestinationCity = this.formatFinalDestinationCity(destinationCity)
    const formattedFinalDestinationProvince = this.formatFinalDestinationProvince(destinationProvince)
    const formattedTotalTrips = this.formatTotalTrips(totalTrips)
    const formattedTotalExpenses = this.formatTotalExpenses(totalExpenses)
    const formattedTotalFlightCost = this.formatTotalFlightCost(totalFlightCost)
    const formattedAverageDurationDays = this.formatAverageDurationDays(averageDurationDays)
    const formattedAverageExpensesPerDay = this.formatAverageExpensesPerDay(averageExpensesPerDay)
    const formattedAverageRoundTripFlightCost =
      this.formatAverageRoundTripFlightCost(averageRoundTripFlightCost)

    return {
      [FlightStatisticReportHeaders.DEPARTMENT_MAILCODE]: formattedDepartmentMailcode,
      [FlightStatisticReportHeaders.FINAL_DESTINATION_CITY]: formattedFinalDestinationCity,
      [FlightStatisticReportHeaders.FINAL_DESTINATION_PROVINCE]: formattedFinalDestinationProvince,
      [FlightStatisticReportHeaders.TOTAL_TRIPS]: formattedTotalTrips,
      [FlightStatisticReportHeaders.TOTAL_EXPENSES]: formattedTotalExpenses,
      [FlightStatisticReportHeaders.TOTAL_FLIGHT_COST]: formattedTotalFlightCost,
      [FlightStatisticReportHeaders.AVERAGE_DURATION_DAYS]: formattedAverageDurationDays,
      [FlightStatisticReportHeaders.AVERAGE_EXPENSES_PER_DAY]: formattedAverageExpensesPerDay,
      [FlightStatisticReportHeaders.AVERAGE_ROUND_TRIP_FLIGHT_COST]: formattedAverageRoundTripFlightCost,
    }
  }

  private formatDepartmentMailcode(
    departmentMailcode: FlightStatistic["departmentMailcode"]
  ): string {
    if (isNil(departmentMailcode)) {
      return ""
    }

    return departmentMailcode
  }

  private formatFinalDestinationCity(
    destinationCity: FlightStatistic["destinationCity"]
  ): string {
    if (isNil(destinationCity)) {
      return ""
    }

    return destinationCity
  }

  private formatFinalDestinationProvince(
    destinationProvince: FlightStatistic["destinationProvince"]
  ): string {
    if (isNil(destinationProvince)) {
      return ""
    }

    return destinationProvince
  }

  private formatTotalTrips(
    totalTrips: FlightStatistic["totalTrips"]
  ): string | number {
    if (isNil(totalTrips)) {
      return ""
    }

    return totalTrips
  }

  private formatTotalExpenses(
    totalExpenses: FlightStatistic["totalExpenses"]
  ): string {
    return formatCurrency(totalExpenses)
  }

  private formatTotalFlightCost(
    totalFlightCost: FlightStatistic["totalFlightCost"]
  ): string {
    return formatCurrency(totalFlightCost)
  }

  private formatAverageDurationDays(
    averageDurationDays: FlightStatistic["averageDurationDays"]
  ): string | number {
    if (isNil(averageDurationDays)) {
      return ""
    }

    return averageDurationDays
  }

  private formatAverageExpensesPerDay(
    averageExpensesPerDay: FlightStatistic["averageExpensesPerDay"]
  ): string {
    return formatCurrency(averageExpensesPerDay)
  }

  private formatAverageRoundTripFlightCost(
    averageRoundTripFlightCost: FlightStatistic["averageRoundTripFlightCost"]
  ): string {
    return formatCurrency(averageRoundTripFlightCost)
  }
}

export default ReportSerializer
