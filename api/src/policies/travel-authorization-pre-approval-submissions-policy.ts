import { Attributes, FindOptions } from "sequelize"
import { isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApprovalSubmission, User } from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelAuthorizationPreApprovalSubmissionsPolicy extends PolicyFactory(
  TravelAuthorizationPreApprovalSubmission
) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return this.record.department === this.user.department
  }

  create(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    return [
      "department",
      "status",
      "preApprovalIds",
      "approverId",
      "approvedAt",
      {
        preApprovalsAttributes: ["id", "status"],
      },
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }

  static policyScope(
    user: User
  ): FindOptions<Attributes<TravelAuthorizationPreApprovalSubmission>> {
    if (user.roles.includes(User.Roles.ADMIN)) {
      return ALL_RECORDS_SCOPE
    }

    if (isNil(user.department)) {
      return NO_RECORDS_SCOPE
    }

    return {
      where: {
        department: user.department,
      },
    }
  }
}

export default TravelAuthorizationPreApprovalSubmissionsPolicy
