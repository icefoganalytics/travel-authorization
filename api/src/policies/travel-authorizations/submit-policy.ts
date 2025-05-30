import { Path } from "@/utils/deep-pick"

import { TravelAuthorization, TravelSegment } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import DraftStatePolicy from "@/policies/travel-authorizations/draft-state-policy"
import PolicyFactory from "@/policies/policy-factory"

export class SubmitPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  permittedAttributesForCreate(): Path[] {
    const attributes = this.draftStatePolicy.permittedAttributes()

    if (this.user.isAdmin || this.record.supervisorEmail === this.user.email) {
      attributes.push({
        travelAuthorizationActionLogAttributes: ["note"],
      })
    }

    return attributes
  }

  protected get draftStatePolicy(): DraftStatePolicy {
    return new DraftStatePolicy(this.user, this.record)
  }

  protected get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default SubmitPolicy
