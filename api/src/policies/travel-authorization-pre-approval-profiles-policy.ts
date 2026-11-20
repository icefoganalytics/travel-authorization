import { Attributes, FindOptions } from "@sequelize/core"
import { isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApprovalProfile, User } from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelAuthorizationPreApprovalProfilesPolicy extends PolicyFactory(
  TravelAuthorizationPreApprovalProfile
) {
  show(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.department === this.user.department) return true

    return false
  }

  create(): boolean {
    if (this.user.isAdmin) return true
    if (isNil(this.record.preApproval?.department)) return false
    if (this.record.preApproval.department === this.user.department) return true

    return false
  }

  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.department !== this.user.department) return false
    if (this.record.preApproval?.department === this.user.department) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.department !== this.user.department) return false
    if (this.record.preApproval?.department === this.user.department) return true

    return false
  }

  permittedAttributes(): Path[] {
    return ["profileName", "branch"]
  }

  static permittedAttributesForCreate(): Path[] {
    return ["profileName", "department", "branch"]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationPreApprovalProfile>> {
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

export default TravelAuthorizationPreApprovalProfilesPolicy
