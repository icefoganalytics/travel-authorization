import { Path } from "@/utils/deep-pick"
import { TravelSegment } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ApproveStatePolicy extends GenericStatePolicy {
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
