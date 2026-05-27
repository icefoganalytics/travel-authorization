import { isNil, isUndefined, pick } from "lodash"

import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { TravelAuthorizationPreApprovalSubmissions } from "@/serializers"

export type TravelAuthorizationPreApprovalAsShow = Pick<
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
> & {
  submission?: TravelAuthorizationPreApprovalSubmissions.AsReference | null
}

export class ShowSerializer extends BaseSerializer<TravelAuthorizationPreApproval> {
  constructor(
    protected record: TravelAuthorizationPreApproval,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationPreApprovalAsShow {
    const { submission } = this.record
    if (isUndefined(submission)) {
      throw new Error("Expected submission to be preloaded")
    }

    const serializedSubmission = this.serializeSubmission(submission)

    return {
      ...pick(this.record, [
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
      ]),
      submission: serializedSubmission,
    }
  }

  private serializeSubmission(
    submission: TravelAuthorizationPreApprovalSubmission | null
  ): TravelAuthorizationPreApprovalSubmissions.AsReference | null {
    if (isNil(submission)) return null

    return TravelAuthorizationPreApprovalSubmissions.ReferenceSerializer.perform(submission)
  }
}

export default ShowSerializer
