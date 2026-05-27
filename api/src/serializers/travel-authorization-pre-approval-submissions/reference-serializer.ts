import { pick } from "lodash"

import { TravelAuthorizationPreApprovalSubmission } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationPreApprovalSubmissionAsReference = Pick<
  TravelAuthorizationPreApprovalSubmission,
  | "id"
  | "creatorId"
  | "approverId"
  | "approvedAt"
  | "status"
  | "department"
  | "createdAt"
  | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<TravelAuthorizationPreApprovalSubmission> {
  perform(): TravelAuthorizationPreApprovalSubmissionAsReference {
    return pick(this.record, [
      "id",
      "creatorId",
      "approverId",
      "approvedAt",
      "status",
      "department",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default ReferenceSerializer
