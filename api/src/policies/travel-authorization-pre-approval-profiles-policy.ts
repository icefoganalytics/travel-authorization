import { Attributes, FindOptions } from "@sequelize/core"
import { isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalProfile,
  User,
} from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import { ProfilePolicy } from "@/policies/travel-authorization-pre-approvals"

export class TravelAuthorizationPreApprovalProfilesPolicy extends PolicyFactory(
  TravelAuthorizationPreApprovalProfile
) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return this.isInRecordDepartment
  }

  create(): boolean {
    return this.profilePolicy?.create() ?? false
  }

  update(): boolean {
    if (!this.user.isAdmin && !this.isInRecordDepartment) {
      return false
    }

    return this.profilePolicy?.update() ?? false
  }

  destroy(): boolean {
    if (!this.user.isAdmin && !this.isInRecordDepartment) {
      return false
    }

    return this.profilePolicy?.destroy() ?? false
  }

  permittedAttributes(): Path[] {
    return ["profileName", "branch"]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationPreApprovalProfile>> {
    if (user.roles.includes(User.Roles.ADMIN)) {
      return ALL_RECORDS_SCOPE
    }

    if (!TravelAuthorizationPreApproval.isResolvedDepartment(user.department)) {
      return NO_RECORDS_SCOPE
    }

    return {
      where: {
        department: user.department,
      },
    }
  }

  private get isInRecordDepartment(): boolean {
    const { department } = this.user
    return (
      TravelAuthorizationPreApproval.isResolvedDepartment(department) &&
      department === this.record.department
    )
  }

  private get profilePolicy(): ProfilePolicy | undefined {
    const { preApproval } = this.record
    if (isNil(preApproval)) {
      return undefined
    }

    return new ProfilePolicy(this.user, preApproval)
  }
}

export default TravelAuthorizationPreApprovalProfilesPolicy
