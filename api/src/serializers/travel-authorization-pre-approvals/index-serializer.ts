import { pick } from "lodash"

import { TravelAuthorizationPreApproval, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationPreApprovalAsIndex = Pick<
  TravelAuthorizationPreApproval,
  | "id"
  | "creatorId"
  | "submissionId"
  | "estimatedCost"
  | "location"
  | "department"
  | "branch"
  | "purpose"
  | "reason"
  | "startDate"
  | "endDate"
  | "isOpenForAnyDate"
  | "month"
  | "isOpenForAnyTraveler"
  | "numberTravelers"
  | "travelerNotes"
  | "status"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelAuthorizationPreApproval> {
  constructor(
    protected record: TravelAuthorizationPreApproval,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationPreApprovalAsIndex {
    return pick(this.record, [
      "id",
      "creatorId",
      "submissionId",
      "estimatedCost",
      "location",
      "department",
      "branch",
      "purpose",
      "reason",
      "startDate",
      "endDate",
      "isOpenForAnyDate",
      "month",
      "isOpenForAnyTraveler",
      "numberTravelers",
      "travelerNotes",
      "status",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default IndexSerializer
