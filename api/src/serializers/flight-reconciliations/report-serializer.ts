import { startCase, toLower } from "lodash"
import { DateTime } from "luxon"

import { type FlightReconciliation } from "@/models"
import formatCurrency from "@/utils/format-currency"
import BaseSerializer from "@/serializers/base-serializer"

export enum FlightReconciliationReportHeaders {
  PURCHASE_DATE = "Purchase Date",
  COST = "Cost",
  AGENT = "Agent",
  AIRLINE = "Airline",
  FLIGHT_INFO = "Flight Info",
  FINAL_DESTINATION = "Final Destination",
  DEPARTMENT_MAILCODE = "Department Mailcode",
  TRAVELER_FIRST_NAME = "Traveler First Name",
  TRAVELER_LAST_NAME = "Traveler Last Name",
  RECONCILED = "Reconciled",
  RECONCILE_PERIOD = "Reconcile Period",
}

export type FlightReconciliationAsReport = Record<FlightReconciliationReportHeaders, string | number>

export class ReportSerializer extends BaseSerializer<FlightReconciliation> {
  perform(): FlightReconciliationAsReport {
    const cost = formatCurrency(Number(this.record.invoiceDetailSellingFare))
    const purchaseDate = this.record.invoiceBookingDate
      ? DateTime.fromJSDate(this.record.invoiceBookingDate).toFormat("MMM d yyyy")
      : ""
    const agent = startCase(toLower(this.record.invoiceDetailComputedAgentName ?? ""))
    const airline = startCase(toLower(this.record.invoiceDetailVendorName))
    const flightInfo = this.record.segmentsComputedFlightInfo?.split(",").join("\r\n") ?? ""

    return {
      [FlightReconciliationReportHeaders.PURCHASE_DATE]: purchaseDate,
      [FlightReconciliationReportHeaders.COST]: cost,
      [FlightReconciliationReportHeaders.AGENT]: agent,
      [FlightReconciliationReportHeaders.AIRLINE]: airline,
      [FlightReconciliationReportHeaders.FLIGHT_INFO]: flightInfo,
      [FlightReconciliationReportHeaders.FINAL_DESTINATION]:
        this.record.segmentsComputedFinalDestination ?? "",
      [FlightReconciliationReportHeaders.DEPARTMENT_MAILCODE]:
        this.record.invoiceDepartmentMailcode ?? "",
      [FlightReconciliationReportHeaders.TRAVELER_FIRST_NAME]:
        this.record.invoiceDetailComputedTravelerFirstName,
      [FlightReconciliationReportHeaders.TRAVELER_LAST_NAME]:
        this.record.invoiceDetailComputedTravelerLastName,
      [FlightReconciliationReportHeaders.RECONCILED]: this.record.reconciled ? "Yes" : "No",
      [FlightReconciliationReportHeaders.RECONCILE_PERIOD]: this.record.reconcilePeriod ?? "",
    }
  }
}

export default ReportSerializer
