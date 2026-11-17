import { isNil, startCase, toLower } from "lodash"
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

export const FLIGHT_RECONCILIATION_REPORT_HEADERS = Object.values(FlightReconciliationReportHeaders)

export type FlightReconciliationAsReport = Record<FlightReconciliationReportHeaders, string | number>

export class ReportSerializer extends BaseSerializer<FlightReconciliation> {
  perform(): FlightReconciliationAsReport {
    const {
      invoiceBookingDate,
      invoiceDetailSellingFare,
      invoiceDetailComputedAgentName,
      invoiceDetailVendorName,
      segmentsComputedFlightInfo,
      segmentsComputedFinalDestination,
      invoiceDepartmentMailcode,
      invoiceDetailComputedTravelerFirstName,
      invoiceDetailComputedTravelerLastName,
      reconciled,
      reconcilePeriod,
    } = this.record

    const formattedPurchaseDate = this.formatPurchaseDate(invoiceBookingDate)
    const formattedCost = this.formatCost(invoiceDetailSellingFare)
    const formattedAgent = this.formatAgent(invoiceDetailComputedAgentName)
    const formattedAirline = this.formatAirline(invoiceDetailVendorName)
    const formattedFlightInfo = this.formatFlightInfo(segmentsComputedFlightInfo)
    const formattedFinalDestination = this.formatFinalDestination(segmentsComputedFinalDestination)
    const formattedDepartmentMailcode = this.formatDepartmentMailcode(invoiceDepartmentMailcode)
    const formattedReconciled = this.formatReconciled(reconciled)
    const formattedReconcilePeriod = this.formatReconcilePeriod(reconcilePeriod)

    return {
      [FlightReconciliationReportHeaders.PURCHASE_DATE]: formattedPurchaseDate,
      [FlightReconciliationReportHeaders.COST]: formattedCost,
      [FlightReconciliationReportHeaders.AGENT]: formattedAgent,
      [FlightReconciliationReportHeaders.AIRLINE]: formattedAirline,
      [FlightReconciliationReportHeaders.FLIGHT_INFO]: formattedFlightInfo,
      [FlightReconciliationReportHeaders.FINAL_DESTINATION]: formattedFinalDestination,
      [FlightReconciliationReportHeaders.DEPARTMENT_MAILCODE]: formattedDepartmentMailcode,
      [FlightReconciliationReportHeaders.TRAVELER_FIRST_NAME]: invoiceDetailComputedTravelerFirstName,
      [FlightReconciliationReportHeaders.TRAVELER_LAST_NAME]: invoiceDetailComputedTravelerLastName,
      [FlightReconciliationReportHeaders.RECONCILED]: formattedReconciled,
      [FlightReconciliationReportHeaders.RECONCILE_PERIOD]: formattedReconcilePeriod,
    }
  }

  private formatPurchaseDate(
    invoiceBookingDate: FlightReconciliation["invoiceBookingDate"]
  ): string {
    if (isNil(invoiceBookingDate)) {
      return ""
    }

    return DateTime.fromJSDate(invoiceBookingDate).toFormat("MMM d yyyy")
  }

  private formatCost(
    invoiceDetailSellingFare: FlightReconciliation["invoiceDetailSellingFare"]
  ): string {
    return formatCurrency(Number(invoiceDetailSellingFare))
  }

  private formatAgent(
    invoiceDetailComputedAgentName: FlightReconciliation["invoiceDetailComputedAgentName"]
  ): string {
    if (isNil(invoiceDetailComputedAgentName)) {
      return ""
    }

    return startCase(toLower(invoiceDetailComputedAgentName))
  }

  private formatAirline(
    invoiceDetailVendorName: FlightReconciliation["invoiceDetailVendorName"]
  ): string {
    return startCase(toLower(invoiceDetailVendorName))
  }

  private formatFlightInfo(
    segmentsComputedFlightInfo: FlightReconciliation["segmentsComputedFlightInfo"]
  ): string {
    if (isNil(segmentsComputedFlightInfo)) {
      return ""
    }

    return segmentsComputedFlightInfo.split(",").join("\r\n")
  }

  private formatFinalDestination(
    segmentsComputedFinalDestination: FlightReconciliation["segmentsComputedFinalDestination"]
  ): string {
    if (isNil(segmentsComputedFinalDestination)) {
      return ""
    }

    return segmentsComputedFinalDestination
  }

  private formatDepartmentMailcode(
    invoiceDepartmentMailcode: FlightReconciliation["invoiceDepartmentMailcode"]
  ): string {
    if (isNil(invoiceDepartmentMailcode)) {
      return ""
    }

    return invoiceDepartmentMailcode
  }

  private formatReconciled(
    reconciled: FlightReconciliation["reconciled"]
  ): string {
    if (reconciled) {
      return "Yes"
    }

    return "No"
  }

  private formatReconcilePeriod(
    reconcilePeriod: FlightReconciliation["reconcilePeriod"]
  ): string | number {
    if (isNil(reconcilePeriod)) {
      return ""
    }

    return reconcilePeriod
  }
}

export default ReportSerializer
