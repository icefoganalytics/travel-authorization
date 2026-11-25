import { Attributes, FindOptions } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApproval, User } from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelAuthorizationPreApprovalsPolicy extends PolicyFactory(
  TravelAuthorizationPreApproval
) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return this.isInRecordDepartment
  }

  create(): boolean {
    if (this.user.isAdmin) return true

    return this.isInRecordDepartment
  }

  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.user.isPreApprovedTravelAdmin) {
      return this.isInRecordDepartment
    }

    return this.record.creatorId === this.user.id
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true
    if (this.user.isPreApprovedTravelAdmin) {
      return this.isInRecordDepartment
    }

    return this.record.creatorId === this.user.id
  }

  permittedAttributes(): Path[] {
    return [
      "estimatedCost",
      "location",
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
      "department",
      {
        profilesAttributes: ["profileName", "department", "branch"],
      },
    ]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationPreApproval>> {
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
}

export default TravelAuthorizationPreApprovalsPolicy
