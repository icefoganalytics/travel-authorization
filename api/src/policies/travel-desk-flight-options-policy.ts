import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskFlightOption, TravelDeskFlightSegment } from "@/models"
import { allRecordsScope } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelDeskFlightSegmentsPolicy from "@/policies/travel-desk-flight-segments-policy"

export class TravelDeskFlightOptionsPolicy extends PolicyFactory(TravelDeskFlightOption) {
  // TODO: add ability for traveller to create/read/update/delete their own data
  // Might need to add travelerId to a bunch of models?
  show(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return this.record.travelerId === this.user.id
  }

  create(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return this.record.travelerId === this.user.id
  }

  destroy(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    if (this.user.isTravelDeskUser || this.user.isAdmin) {
      return ["flightRequestId", "cost", "flightPreferenceOrder", "leg", "duration"]
    }

    return ["flightPreferenceOrder"]
  }

  permittedAttributesForCreate(): Path[] {
    return [
      "travelerId",
      ...this.permittedAttributes(),
      {
        flightSegmentsAttributes:
          this.travelDeskFlightSegmentsPolicy.permittedAttributesForCreate(),
      },
    ]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskFlightOption>> {
    if (user.isTravelDeskUser || user.isAdmin) {
      return allRecordsScope
    }

    return {
      where: {
        travelerId: user.id,
      },
    }
  }

  private get travelDeskFlightSegmentsPolicy() {
    const travelDeskFlightSegment = TravelDeskFlightSegment.build()
    return new TravelDeskFlightSegmentsPolicy(this.user, travelDeskFlightSegment)
  }
}

export default TravelDeskFlightOptionsPolicy
