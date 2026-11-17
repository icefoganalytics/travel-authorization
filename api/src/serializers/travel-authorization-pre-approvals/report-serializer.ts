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
    const {
      profiles,
      department,
      branch,
      isOpenForAnyDate,
      month,
      startDate,
      endDate,
      location,
      purpose,
      estimatedCost,
      reason,
      status,
      travelerNotes,
    } = this.record

    const formattedName = this.formatName(profiles)
    const formattedDepartment = this.formatDepartment(department)
    const formattedBranch = this.formatBranch(branch)
    const formattedTravelDate = this.formatTravelDate(isOpenForAnyDate, month, startDate, endDate)
    const formattedLocation = this.formatLocation(location)
    const formattedPurpose = this.formatPurpose(purpose)
    const formattedEstimatedCost = this.formatEstimatedCost(estimatedCost)
    const formattedReason = this.formatReason(reason)
    const formattedStatus = this.formatStatus(status)
    const formattedNotes = this.formatNotes(travelerNotes)

    return {
      [TravelAuthorizationPreApprovalReportHeaders.NAME]: formattedName,
      [TravelAuthorizationPreApprovalReportHeaders.DEPARTMENT]: formattedDepartment,
      [TravelAuthorizationPreApprovalReportHeaders.BRANCH]: formattedBranch,
      [TravelAuthorizationPreApprovalReportHeaders.TRAVEL_DATE]: formattedTravelDate,
      [TravelAuthorizationPreApprovalReportHeaders.LOCATION]: formattedLocation,
      [TravelAuthorizationPreApprovalReportHeaders.PURPOSE]: formattedPurpose,
      [TravelAuthorizationPreApprovalReportHeaders.ESTIMATED_COST]: formattedEstimatedCost,
      [TravelAuthorizationPreApprovalReportHeaders.REASON]: formattedReason,
      [TravelAuthorizationPreApprovalReportHeaders.STATUS]: formattedStatus,
      [TravelAuthorizationPreApprovalReportHeaders.NOTES]: formattedNotes,
    }
  }

  private formatName(profiles: TravelAuthorizationPreApproval["profiles"]): string {
    if (isUndefined(profiles)) {
      throw new Error("Expected pre-approval profiles association to be preloaded.")
    }

    return profiles.map((profile) => profile.profileName.replace(".", " ")).join(", ")
  }

  private formatDepartment(department: TravelAuthorizationPreApproval["department"]): string {
    if (isNil(department)) {
      return ""
    }

    return department
  }

  private formatBranch(branch: TravelAuthorizationPreApproval["branch"]): string {
    if (isNil(branch)) {
      return ""
    }

    return branch
  }

  private formatTravelDate(
    isOpenForAnyDate: TravelAuthorizationPreApproval["isOpenForAnyDate"],
    month: TravelAuthorizationPreApproval["month"],
    startDate: TravelAuthorizationPreApproval["startDate"],
    endDate: TravelAuthorizationPreApproval["endDate"]
  ): string {
    if (isOpenForAnyDate) {
      if (isNil(month)) {
        return ""
      }

      return month
    }

    const dates = [startDate, endDate]
    return dates
      .filter((date): date is Date => !isNil(date))
      .map((date) => date.toISOString())
      .join(" to ")
  }

  private formatLocation(location: TravelAuthorizationPreApproval["location"]): string {
    if (isNil(location)) {
      return ""
    }

    return location
  }

  private formatPurpose(purpose: TravelAuthorizationPreApproval["purpose"]): string {
    if (isNil(purpose)) {
      return ""
    }

    return purpose
  }

  private formatEstimatedCost(estimatedCost: TravelAuthorizationPreApproval["estimatedCost"]): string {
    return formatCurrency(estimatedCost)
  }

  private formatReason(reason: TravelAuthorizationPreApproval["reason"]): string {
    if (isNil(reason)) {
      return ""
    }

    return reason
  }

  private formatStatus(status: TravelAuthorizationPreApproval["status"]): string {
    if (isNil(status)) {
      return ""
    }

    return status
  }

  private formatNotes(travelerNotes: TravelAuthorizationPreApproval["travelerNotes"]): string {
    if (isNil(travelerNotes)) {
      return ""
    }

    return travelerNotes
  }
}

export default ReportSerializer
