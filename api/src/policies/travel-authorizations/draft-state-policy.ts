import { Path } from "@/utils/deep-pick"

import { TravelSegment } from "@/models"
import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

export class DraftStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  destroy(): boolean {
    if (this.record.userId === this.user.id) return true

    return false
  }

  permittedAttributes(): Path[] {
    const travelSegmentEstimatesAttributes =
      this.travelSegmentsPolicy.permittedAttributesForBulkReplace()
    const inheritedAttributes = super.permittedAttributes()

    return [
      ...inheritedAttributes,
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
      "estimatedPrimaryDestinationId",
      "travelAdvanceInCents",
      "allTravelWithinTerritory",
      {
        travelSegmentEstimatesAttributes,
      },
    ]
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default DraftStatePolicy
