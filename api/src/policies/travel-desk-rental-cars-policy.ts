import { type FindOptions, type Attributes } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskRentalCar } from "@/models"
import TravelDeskTravelRequestsPolicy from "@/policies/travel-desk-travel-requests-policy"

import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"

export class TravelDeskRentalCarsPolicy extends PolicyFactory(TravelDeskRentalCar) {
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

  permittedAttributes(): Path[] {
    return [
      "pickUpCity",
      "pickUpLocation",
      "pickUpLocationOther",
      "dropOffCity",
      "dropOffLocation",
      "dropOffLocationOther",
      "sameDropOffLocation",
      "matchFlightTimes",
      "vehicleTypeChangeIndicator",
      "vehicleType",
      "vehicleChangeRationale",
      "pickUpDate",
      "dropOffDate",
      "additionalNotes",
      "reservedVehicleInfo",
      "booking",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["travelRequestId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskRentalCar>> {
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
      throw new Error("Travel request is required")
    }

    return new TravelDeskTravelRequestsPolicy(this.user, travelRequest)
  }
}

export default TravelDeskRentalCarsPolicy
