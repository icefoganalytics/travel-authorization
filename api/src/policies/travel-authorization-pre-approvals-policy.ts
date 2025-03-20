import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApproval, User } from "@/models"
import { allRecordsScope } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

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
    return [...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationPreApproval>> {
    if (user.roles.includes(User.Roles.ADMIN)) {
      return allRecordsScope
    }

    return {
      where: {
        department: user.department,
      },
    }
  }
}

export default TravelAuthorizationPreApprovalsPolicy
