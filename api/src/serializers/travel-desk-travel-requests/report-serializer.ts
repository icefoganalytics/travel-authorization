import { isEmpty } from "lodash"

import { TravelDeskTravelRequest, type User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { IndexSerializer } from "@/serializers/travel-desk-travel-requests/index-serializer"

export enum TravelDeskTravelRequestReportHeaders {
  SUBMIT_DATE = "Submit Date",
  NAME = "Name",
  DEPARTMENT = "Department",
  BRANCH = "Branch",
  TRAVEL_START_DATE = "Travel Start Date",
  TRAVEL_END_DATE = "Travel End Date",
  LOCATION = "Location",
  REQUESTED = "Requested",
  STATUS = "Status",
  TRAVEL_DESK_OFFICER = "Travel Desk Officer",
}

export type TravelDeskTravelRequestAsReport = Record<TravelDeskTravelRequestReportHeaders, string>

export class ReportSerializer extends BaseSerializer<TravelDeskTravelRequest> {
  constructor(
    protected record: TravelDeskTravelRequest,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelDeskTravelRequestAsReport {
    const indexedRequest = IndexSerializer.perform(this.record, this.currentUser)
    const submitDate = indexedRequest.createdAt.toISOString().slice(0, 10)
    const reportStatus = this.formatStatus(indexedRequest.status, indexedRequest.travelDeskOfficer)

    return {
      [TravelDeskTravelRequestReportHeaders.SUBMIT_DATE]: submitDate,
      [TravelDeskTravelRequestReportHeaders.NAME]: indexedRequest.userDisplayName,
      [TravelDeskTravelRequestReportHeaders.DEPARTMENT]: indexedRequest.department,
      [TravelDeskTravelRequestReportHeaders.BRANCH]: indexedRequest.branch,
      [TravelDeskTravelRequestReportHeaders.TRAVEL_START_DATE]: indexedRequest.travelStartDate,
      [TravelDeskTravelRequestReportHeaders.TRAVEL_END_DATE]: indexedRequest.travelEndDate,
      [TravelDeskTravelRequestReportHeaders.LOCATION]: indexedRequest.locationsTraveled,
      [TravelDeskTravelRequestReportHeaders.REQUESTED]: indexedRequest.requestedOptions,
      [TravelDeskTravelRequestReportHeaders.STATUS]: reportStatus,
      [TravelDeskTravelRequestReportHeaders.TRAVEL_DESK_OFFICER]:
        indexedRequest.travelDeskOfficer ?? "",
    }
  }

  private formatStatus(
    status: TravelDeskTravelRequest["status"],
    travelDeskOfficer: TravelDeskTravelRequest["travelDeskOfficer"]
  ): string {
    // TODO: Consider an explicit "Not Started" status; inferring workflow state
    // from the absence of an assigned officer is ambiguous.
    if (status === TravelDeskTravelRequest.Statuses.SUBMITTED && isEmpty(travelDeskOfficer)) {
      return "Not Started"
    }

    switch (status) {
      case TravelDeskTravelRequest.Statuses.BOOKED:
        return "Booked"
      case TravelDeskTravelRequest.Statuses.COMPLETE:
        return "Complete"
      case TravelDeskTravelRequest.Statuses.DRAFT:
        return "Draft"
      case TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED:
        return "Options Provided"
      case TravelDeskTravelRequest.Statuses.OPTIONS_RANKED:
        return "Options Ranked"
      case TravelDeskTravelRequest.Statuses.SUBMITTED:
        return "Submitted"
      default:
        return status
    }
  }
}

export default ReportSerializer
