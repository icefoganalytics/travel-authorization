import { Path } from "@/utils/deep-pick"
import { TravelSegment } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ApproveStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  permittedAttributes(): Path[] {
    return [
      ...super.permittedAttributes(),
      "daysOffTravelStatusActual",
      "dateBackToWorkActual",
      "travelDurationActual",
      "tripTypeActual",
      {
        travelSegmentActualsAttributes: this.travelSegmentsPolicy.permittedAttributesForCreate(),
      },
    ]
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default ApproveStatePolicy
