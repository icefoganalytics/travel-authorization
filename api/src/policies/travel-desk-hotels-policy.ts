import { Attributes, FindOptions } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"

import { User, TravelDeskHotel } from "@/models"
import TravelDeskTravelRequestsPolicy from "@/policies/travel-desk-travel-requests-policy"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelDeskHotelsPolicy extends PolicyFactory(TravelDeskHotel) {
  show(): boolean {
    return this.travelDeskTravelRequestsPolicy.show()
  }

  create(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  update(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  destroy(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  permittedAttributesForUpdate(): Path[] {
    return [
      "city",
      "isDedicatedConferenceHotelAvailable",
      "conferenceName",
      "conferenceHotelName",
      "checkIn",
      "checkOut",
      "additionalInformation",
      "reservedHotelInfo",
      "booking",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["travelRequestId", ...this.permittedAttributesForUpdate()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskHotel>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    const travelDeskTravelRequestsPolicyScope = TravelDeskTravelRequestsPolicy.policyScope(user)

    return {
      include: [
        {
          association: "travelRequest",
          required: true,
          ...travelDeskTravelRequestsPolicyScope,
        },
      ],
    }
  }

  private get travelDeskTravelRequestsPolicy(): TravelDeskTravelRequestsPolicy {
    const { travelRequest } = this.record
    if (isUndefined(travelRequest)) {
      throw new Error("Expected travelRequest association to be pre-loaded")
    }

    return new TravelDeskTravelRequestsPolicy(this.user, travelRequest)
  }
}

export default TravelDeskHotelsPolicy
