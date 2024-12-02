import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskFlightOption } from "@/models"
import { allRecordsScope, noRecordsScope } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelDeskFlightOptionsPolicy extends PolicyFactory(TravelDeskFlightOption) {
  // TODO: add ability for traveller to create/read/update/delete their own data
  // Might need to add travelerId to a bunch of models?
  show(): boolean {
    return this.user.isTravelDeskUser || this.user.isAdmin
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
    return ["cost", "flightPreferenceOrder", "leg", "duration"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["flightRequestId", "travelerId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskFlightOption>> {
    if (user.isTravelDeskUser || user.isAdmin) {
      return allRecordsScope
    }

    return noRecordsScope
  }
}

export default TravelDeskFlightOptionsPolicy