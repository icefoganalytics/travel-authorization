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
    const travelSegmentActualsAttributes =
      this.travelSegmentsPolicy.permittedAttributesForBulkReplace()
    const inheritedAttributes = super.permittedAttributes()

    return [
      ...inheritedAttributes,
      "daysOffTravelStatusActual",
      "dateBackToWorkActual",
      "travelDurationActual",
      "tripTypeActual",
      "actualPrimaryDestinationId",
      {
        travelSegmentActualsAttributes,
      },
    ]
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default ApproveStatePolicy
