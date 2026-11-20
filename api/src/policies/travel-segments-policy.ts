import { Attributes, FindOptions } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { TravelSegment, User } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class TravelSegmentsPolicy extends PolicyFactory(TravelSegment) {
  show(): boolean {
    return this.travelAuthorizationPolicy.show()
  }

  create(): boolean {
    return this.travelAuthorizationPolicy.update()
  }

  update(): boolean {
    return this.travelAuthorizationPolicy.update()
  }

  destroy(): boolean {
    return this.travelAuthorizationPolicy.update()
  }

  permittedAttributes(): Path[] {
    return [
      "departureLocationId",
      "arrivalLocationId",
      "segmentNumber",
      "departureOn",
      "departureTime",
      "modeOfTransport",
      "modeOfTransportOther",
      "accommodationType",
      "accommodationTypeOther",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["travelAuthorizationId", "isActual", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelSegment>> {
    if (user.isAdmin) {
      return ALL_RECORDS_SCOPE
    }

    return {
      include: [
        {
          association: "travelAuthorization",
          required: true,
          ...TravelAuthorizationsPolicy.policyScope(user),
        },
      ],
    }
  }

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Record must have pre-loaded travel authorization association")
    }

    return new TravelAuthorizationsPolicy(this.user, travelAuthorization)
  }
}

export default TravelSegmentsPolicy
