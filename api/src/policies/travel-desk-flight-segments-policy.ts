import { Attributes, FindOptions } from "sequelize"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskFlightSegment, TravelDeskFlightOption } from "@/models"
import { allRecordsScope } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelDeskFlightOptionsPolicy from "@/policies/travel-desk-flight-options-policy"

export class TravelDeskFlightSegmentsPolicy extends PolicyFactory(TravelDeskFlightSegment) {
  // TODO: add ability for traveller to create/read/update/delete their own data
  // Might need to add travelerId to a bunch of models?
  show(): boolean {
    return this.travelDeskFlightOptionsPolicy.show()
  }

  create(): boolean {
    return this.user.isTravelDeskUser || this.user.isAdmin
  }

  update(): boolean {
    return this.user.isTravelDeskUser || this.user.isAdmin
  }

  destroy(): boolean {
    return this.user.isTravelDeskUser || this.user.isAdmin
  }

  permittedAttributes(): Path[] {
    return [
      "flightNumber",
      "departAt",
      "departLocation",
      "arriveAt",
      "arriveLocation",
      "duration",
      "status",
      "class",
      "sortOrder",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["flightOptionId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskFlightSegment>> {
    if (user.isTravelDeskUser || user.isAdmin) {
      return allRecordsScope
    }

    return {
      include: [
        {
          association: "flightOption",
          where: {
            travelerId: user.id,
          },
        },
      ],
    }
  }

  private get travelDeskFlightOption(): TravelDeskFlightOption {
    const { flightOption } = this.record
    if (isUndefined(flightOption)) {
      throw new Error("Flight option is required")
    }

    return flightOption
  }

  private get travelDeskFlightOptionsPolicy(): TravelDeskFlightOptionsPolicy {
    return new TravelDeskFlightOptionsPolicy(this.user, this.travelDeskFlightOption)
  }
}

export default TravelDeskFlightSegmentsPolicy
