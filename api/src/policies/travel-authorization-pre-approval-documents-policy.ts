import { Attributes, FindOptions } from "sequelize"
import { isNil, isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import {
  TravelAuthorizationPreApprovalDocument,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationPreApprovalSubmissionsPolicy from "@/policies/travel-authorization-pre-approval-submissions-policy"

export class TravelAuthorizationPreApprovalDocumentsPolicy extends PolicyFactory(
  TravelAuthorizationPreApprovalDocument
) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return this.submissionPolicy.show()
  }

  create(): boolean {
    if (this.user.isAdmin) return true

    return this.submissionPolicy.update()
  }

  update(): boolean {
    if (this.user.isAdmin) return true

    return this.submissionPolicy.update()
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true

    return this.submissionPolicy.update()
  }

  permittedAttributes(): Path[] {
    return [
      "name",
      // "approvalDocument", // NOTE: current deep-pick algorithm does not support Buffer type.
      "approvalDocumentApproverName",
      "approvalDocumentApprovedOn",
      "sizeInBytes",
      "md5",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["submissionId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationPreApprovalDocument>> {
    if (user.roles.includes(User.Roles.ADMIN)) {
      return ALL_RECORDS_SCOPE
    }

    if (isNil(user.department)) {
      return NO_RECORDS_SCOPE
    }

    return {
      include: [
        {
          association: "submission",
          where: {
            department: user.department,
          },
        },
      ],
    }
  }

  private get submission(): TravelAuthorizationPreApprovalSubmission {
    const { submission } = this.record
    if (isUndefined(submission)) {
      throw new Error("Expected record to have preloaded submission association")
    }

    return submission
  }

  private get submissionPolicy(): TravelAuthorizationPreApprovalSubmissionsPolicy {
    return new TravelAuthorizationPreApprovalSubmissionsPolicy(this.user, this.submission)
  }
}

export default TravelAuthorizationPreApprovalDocumentsPolicy
