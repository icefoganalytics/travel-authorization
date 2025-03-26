import { Attributes, FindOptions } from "sequelize"
import { isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalProfile,
  User,
} from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"

export class TravelAuthorizationPreApprovalsPolicy extends PolicyFactory(
  TravelAuthorizationPreApproval
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
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return [
      ...this.permittedAttributes(),
      {
        profilesAttributes: this.profilesPolicy.permittedAttributesForCreate(),
      },
    ]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationPreApproval>> {
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

  private get profilesPolicy(): TravelAuthorizationPreApprovalProfilesPolicy {
    const travelAuthorizationPreApprovalProfile = TravelAuthorizationPreApprovalProfile.build()
    return new TravelAuthorizationPreApprovalProfilesPolicy(
      this.user,
      travelAuthorizationPreApprovalProfile
    )
  }
}

export default TravelAuthorizationPreApprovalsPolicy
