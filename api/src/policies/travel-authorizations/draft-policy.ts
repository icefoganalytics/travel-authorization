import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { TravelAuthorization, TravelSegment, User } from "@/models"
import { NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import UsersPolicy from "@/policies/users-policy"

export class DraftPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  show(): boolean {
    return false
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  permittedAttributes(): Path[] {
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

  permittedAttributesForCreate(): Path[] {
    const permittedAttributes: Path[] = ["slug", ...this.permittedAttributes()]

    if (this.user.isAdmin) {
      permittedAttributes.push("userId", {
        userAttributes: this.userPolicy.permittedAttributesForCreate(),
      })
    }

    return permittedAttributes
  }

  static policyScope(_user: User): FindOptions<Attributes<TravelAuthorization>> {
    return NO_RECORDS_SCOPE
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }

  protected get userPolicy(): UsersPolicy {
    return new UsersPolicy(this.user, User.build())
  }
}

export default DraftPolicy
