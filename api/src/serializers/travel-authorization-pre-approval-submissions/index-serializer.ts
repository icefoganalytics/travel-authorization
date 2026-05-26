import { pick } from "lodash"

import { TravelAuthorizationPreApprovalSubmission, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationPreApprovalSubmissionAsIndex = Pick<
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

export class IndexSerializer extends BaseSerializer<TravelAuthorizationPreApprovalSubmission> {
  constructor(
    protected record: TravelAuthorizationPreApprovalSubmission,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationPreApprovalSubmissionAsIndex {
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

export default IndexSerializer
