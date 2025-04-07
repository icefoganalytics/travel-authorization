import { Attributes, FindOptions, Op } from "sequelize"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskHotel, TravelDeskTravelRequest } from "@/models"
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
    if (user.isAdmin) {
      return ALL_RECORDS_SCOPE
    }

    return {
      include: [
        {
          association: "travelRequest",
          include: [
            {
              association: "travelAuthorization",
              where: {
                [Op.or]: [
                  {
                    supervisorEmail: user.email,
                  },
                  { userId: user.id },
                ],
              },
            },
          ],
        },
      ],
    }
  }

  private get travelDeskTravelRequest(): TravelDeskTravelRequest {
    const { travelRequest } = this.record
    if (isUndefined(travelRequest)) {
      throw new Error("Travel request is required")
    }

    return travelRequest
  }

  private get travelDeskTravelRequestsPolicy(): TravelDeskTravelRequestsPolicy {
    return new TravelDeskTravelRequestsPolicy(this.user, this.travelDeskTravelRequest)
  }
}

export default TravelDeskHotelsPolicy
