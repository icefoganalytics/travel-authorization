import { Attributes, FindOptions, Op } from "sequelize"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskFlightRequest, TravelDeskTravelRequest } from "@/models"
import TravelDeskTravelRequestsPolicy from "@/policies/travel-desk-travel-requests-policy"

import { allRecordsScope } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelDeskFlightRequestsPolicy extends PolicyFactory(TravelDeskFlightRequest) {
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

  static policyScope(user: User): FindOptions<Attributes<TravelDeskFlightRequest>> {
    if (user.isTravelDeskUser || user.isAdmin) {
      return allRecordsScope
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

  permittedAttributesForUpdate(): Path[] {
    return [
      "departLocation",
      "arriveLocation",
      "datePreference",
      "timePreference",
      "seatPreference",
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

export default TravelDeskFlightRequestsPolicy
