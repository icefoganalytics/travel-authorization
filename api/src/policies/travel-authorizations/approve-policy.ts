import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User, TravelAuthorization, TravelSegment } from "@/models"
import { NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

export class ApprovePolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true

    return false
  }

  permittedAttributes(): Path[] {
    return [
      "wizardStepName",
      "daysOffTravelStatusActual",
      "dateBackToWorkActual",
      "travelDurationActual",
      "tripTypeActual",
      {
        travelSegmentActualsAttributes: this.travelSegmentsPolicy.permittedAttributesForCreate(),
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

export default ApprovePolicy
