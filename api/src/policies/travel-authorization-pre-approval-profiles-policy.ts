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

    return this.record.department === this.user.department
  }

  create(): boolean {
    if (this.user.isAdmin) return true

    return this.record.department === this.user.department
  }

  update(): boolean {
    if (this.user.isAdmin) return true

    return this.record.department === this.user.department
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true

    return this.record.department === this.user.department
  }

  permittedAttributes(): Path[] {
    return ["profileName", "department", "branch"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["preApprovalId", ...this.permittedAttributes()]
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
