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

export class TravelAuthorizationPreApprovalProfilesPolicy extends PolicyFactory(
  TravelAuthorizationPreApprovalProfile
) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return this.record.department === this.user.department
  }

  create(): boolean {
    return TravelAuthorizationPreApprovalProfilesPolicy.canCreateForPreApproval(
      this.user,
      this.record.preApproval
    )
  }

  update(): boolean {
    if (this.user.isAdmin) return true

    return (
      this.record.department === this.user.department &&
      this.record.preApproval?.department === this.user.department
    )
  }

  destroy(): boolean {
    return this.update()
  }

  permittedAttributes(): Path[] {
    return ["profileName", "branch"]
  }

  static permittedAttributesForCreate(): Path[] {
    return ["profileName", "department", "branch"]
  }

  static canCreateForPreApproval(
    user: User,
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval | null | undefined
  ): boolean {
    if (user.isAdmin) return true

    const department = travelAuthorizationPreApproval?.department
    return !isNil(department) && department === user.department
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
