import { isNil, isUndefined } from "lodash"

import formatCurrency from "@/utils/format-currency"

import { type TravelAuthorizationPreApproval } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export enum TravelAuthorizationPreApprovalReportHeaders {
  NAME = "Name",
  DEPARTMENT = "Department",
  BRANCH = "Branch",
  TRAVEL_DATE = "Travel Date",
  LOCATION = "Location",
  PURPOSE = "Purpose",
  ESTIMATED_COST = "Estimated Cost",
  REASON = "Reason",
  STATUS = "Status",
  NOTES = "Notes",
}

export type TravelAuthorizationPreApprovalAsReport = Record<
  TravelAuthorizationPreApprovalReportHeaders,
  string
>

export class ReportSerializer extends BaseSerializer<TravelAuthorizationPreApproval> {
  perform(): TravelAuthorizationPreApprovalAsReport {
    const { profiles } = this.record
    if (isUndefined(profiles)) {
      throw new Error("Expected pre-approval profiles association to be preloaded.")
    }

    const name = profiles.map((profile) => profile.profileName.replace(".", " ")).join(", ")
    const travelDate = this.formatTravelDate(this.record)
    const estimatedCost = formatCurrency(this.record.estimatedCost)

    return {
      [TravelAuthorizationPreApprovalReportHeaders.NAME]: name,
      [TravelAuthorizationPreApprovalReportHeaders.DEPARTMENT]: this.record.department ?? "",
      [TravelAuthorizationPreApprovalReportHeaders.BRANCH]: this.record.branch ?? "",
      [TravelAuthorizationPreApprovalReportHeaders.TRAVEL_DATE]: travelDate,
      [TravelAuthorizationPreApprovalReportHeaders.LOCATION]: this.record.location ?? "",
      [TravelAuthorizationPreApprovalReportHeaders.PURPOSE]: this.record.purpose ?? "",
      [TravelAuthorizationPreApprovalReportHeaders.ESTIMATED_COST]: estimatedCost,
      [TravelAuthorizationPreApprovalReportHeaders.REASON]: this.record.reason ?? "",
      [TravelAuthorizationPreApprovalReportHeaders.STATUS]: this.record.status ?? "",
      [TravelAuthorizationPreApprovalReportHeaders.NOTES]: this.record.travelerNotes ?? "",
    }
  }

  private formatTravelDate(record: TravelAuthorizationPreApproval): string {
    if (record.isOpenForAnyDate) {
      return record.month ?? ""
    }

    const dates = [record.startDate, record.endDate]
    return dates
      .filter((date): date is Date => !isNil(date))
      .map((date) => date.toISOString())
      .join(" to ")
  }
}

export default ReportSerializer
