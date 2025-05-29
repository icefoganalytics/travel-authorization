import { Path } from "@/utils/deep-pick"

import { TravelSegment } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class SubmitStatePolicy extends GenericStatePolicy {
  permittedAttributes(): Path[] {
    const attributes: Path[] = super.permittedAttributes()

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

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default SubmitStatePolicy
