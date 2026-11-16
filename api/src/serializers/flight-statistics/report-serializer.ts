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

export type FlightStatisticAsReport = Record<FlightStatisticReportHeaders, string | number>

export class ReportSerializer extends BaseSerializer<FlightStatistic> {
  perform(): FlightStatisticAsReport {
    const totalExpenses = formatCurrency(this.record.totalExpenses)
    const totalFlightCost = formatCurrency(this.record.totalFlightCost)
    const averageExpensesPerDay = formatCurrency(this.record.averageExpensesPerDay)
    const averageRoundTripFlightCost = formatCurrency(this.record.averageRoundTripFlightCost)

    return {
      [FlightStatisticReportHeaders.DEPARTMENT_MAILCODE]: this.record.departmentMailcode ?? "",
      [FlightStatisticReportHeaders.FINAL_DESTINATION_CITY]: this.record.destinationCity ?? "",
      [FlightStatisticReportHeaders.FINAL_DESTINATION_PROVINCE]: this.record.destinationProvince ?? "",
      [FlightStatisticReportHeaders.TOTAL_TRIPS]: this.record.totalTrips ?? "",
      [FlightStatisticReportHeaders.TOTAL_EXPENSES]: totalExpenses,
      [FlightStatisticReportHeaders.TOTAL_FLIGHT_COST]: totalFlightCost,
      [FlightStatisticReportHeaders.AVERAGE_DURATION_DAYS]: this.record.averageDurationDays ?? "",
      [FlightStatisticReportHeaders.AVERAGE_EXPENSES_PER_DAY]: averageExpensesPerDay,
      [FlightStatisticReportHeaders.AVERAGE_ROUND_TRIP_FLIGHT_COST]: averageRoundTripFlightCost,
    }
  }
}

export default ReportSerializer
