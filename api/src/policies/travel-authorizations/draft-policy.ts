import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { TravelAuthorization, TravelSegment, User } from "@/models"
import { NO_RECORDS_SCOPE } from "@/policies/base-policy"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

export class DraftPolicy extends TravelAuthorizationsPolicy {
  create(): boolean {
    return false
  }

  show(): boolean {
    return false
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
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
    return []
  }

  static policyScope(_user: User): FindOptions<Attributes<TravelAuthorization>> {
    return NO_RECORDS_SCOPE
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default DraftPolicy
