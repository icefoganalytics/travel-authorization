import { ModelStatic, Op } from "sequelize"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskHotel, TravelDeskTravelRequest } from "@/models"
import TravelDeskTravelRequestsPolicy from "@/policies/travel-desk-travel-requests-policy"

import BasePolicy from "@/policies/base-policy"

export class TravelDeskHotelsPolicy extends BasePolicy<TravelDeskHotel> {
  create(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  update(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  destroy(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  static applyScope(
    modelClass: ModelStatic<TravelDeskHotel>,
    currentUser: User
  ): ModelStatic<TravelDeskHotel> {
    if (currentUser.roles.includes(User.Roles.ADMIN)) {
      return modelClass
    }

    return modelClass.scope({
      // @ts-expect-error - Bad types in sequelize, all FindOptions are valid.
      include: [
        {
          association: "travelRequest",
          include: [
            {
              association: "travelAuthorization",
              where: {
                [Op.or]: [
                  {
                    supervisorEmail: currentUser.email,
                  },
                  { userId: currentUser.id },
                ],
              },
            },
          ],
        },
      ],
    })
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
