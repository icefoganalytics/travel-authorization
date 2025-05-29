import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { User, TravelAuthorization, TravelSegment } from "@/models"
import { NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import DraftPolicy from "@/policies/travel-authorizations/draft-policy"

export class SubmitPolicy extends PolicyFactory(TravelAuthorization) {
  show(): boolean {
    return false
  }

  update(): boolean {
    return false
  }

  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  destroy(): boolean {
    return false
  }

  permittedAttributes(): Path[] {
    const attributes: Path[] = ["wizardStepName"]

    if (this.user.isAdmin || this.record.supervisorEmail === this.user.email) {
      attributes.push(
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
          travelSegmentEstimatesAttributes:
            this.travelSegmentsPolicy.permittedAttributesForCreate(),
        }
      )
    }

    return attributes
  }

  permittedAttributesForCreate(): Path[] {
    const attributes = this.draftPolicy.permittedAttributes()
    return [...attributes, { travelAuthorizationActionLogAttributes: ["note"] }]
  }

  static policyScope(_user: User): FindOptions<Attributes<TravelAuthorization>> {
    return NO_RECORDS_SCOPE
  }

  protected get draftPolicy(): DraftPolicy {
    return new DraftPolicy(this.user, this.record)
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default SubmitPolicy
