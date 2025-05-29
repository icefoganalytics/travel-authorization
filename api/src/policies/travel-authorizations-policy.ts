import { Attributes, FindOptions, Op } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User, TravelAuthorization, TravelSegment } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import UsersPolicy from "@/policies/users-policy"

export class TravelAuthorizationsPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  show(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  // Currently the same as the update policy, but this is likely to change in the future
  // so opted for duplication over premature abstraction.
  destroy(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (
      this.record.userId === this.user.id &&
      this.record.status === TravelAuthorization.Statuses.DRAFT
    ) {
      return true
    }

    return false
  }

  // TODO: disperse this complexity into per-state policies
  permittedAttributes(): Path[] {
    const permittedAttributes: Path[] = ["wizardStepName"]

    switch (this.record.status) {
      case TravelAuthorization.Statuses.DRAFT:
        return [...permittedAttributes, ...this.permittedAttributesForBaseUpdate()]
      case TravelAuthorization.Statuses.SUBMITTED:
        if (this.user.isAdmin || this.record.supervisorEmail === this.user.email) {
          permittedAttributes.push(...this.permittedAttributesForBaseUpdate())
        }

        return permittedAttributes
      case TravelAuthorization.Statuses.APPROVED:
        return [...permittedAttributes, ...this.permittedAttributesForApprovedUpdate()]
      default:
        return permittedAttributes
    }
  }

  private permittedAttributesForBaseUpdate(): Path[] {
    return [
      "preApprovalProfileId",
      "purposeId",
      "firstName",
      "lastName",
      "department",
      "division",
      "branch",
      "unit",
      "email",
      "mailcode",
      "daysOffTravelStatusEstimate",
      "dateBackToWorkEstimate",
      "travelDurationEstimate",
      "travelAdvance",
      "eventName",
      "summary",
      "benefits",
      "supervisorEmail",
      "approved",
      "requestChange",
      "denialReason",
      "tripTypeEstimate",
      "travelAdvanceInCents",
      "allTravelWithinTerritory",
      {
        travelSegmentEstimatesAttributes: this.travelSegmentsPolicy.permittedAttributesForCreate(),
      },
    ]
  }

  private permittedAttributesForApprovedUpdate(): Path[] {
    return [
      "daysOffTravelStatusActual",
      "dateBackToWorkActual",
      "travelDurationActual",
      "tripTypeActual",
      {
        travelSegmentActualsAttributes: this.travelSegmentsPolicy.permittedAttributesForCreate(),
      },
    ]
  }

  permittedAttributesForCreate(): Path[] {
    const permittedAttributes: Path[] = ["slug", ...this.permittedAttributes()]

    if (this.user.isAdmin) {
      permittedAttributes.push(
        ...[
          "userId",
          {
            userAttributes: this.userPolicy.permittedAttributesForCreate(),
          },
        ]
      )
    }

    return permittedAttributes
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorization>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    return {
      where: {
        [Op.or]: [
          {
            supervisorEmail: user.email,
          },
          { userId: user.id },
        ],
      },
    }
  }

  protected get userPolicy(): UsersPolicy {
    return new UsersPolicy(this.user, User.build())
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default TravelAuthorizationsPolicy
