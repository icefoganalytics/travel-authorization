import { Path } from "@/utils/deep-pick"

import { TravelSegment } from "@/models"
import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

export class DraftStatePolicy extends GenericStatePolicy {
  permittedAttributes(): Path[] {
    return [
      ...super.permittedAttributes(),
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

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default DraftStatePolicy
