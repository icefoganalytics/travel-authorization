import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { TravelDeskTravelAgency, User } from "@/models"
import { NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class TravelDeskTravelAgenciesPolicy extends PolicyFactory(TravelDeskTravelAgency) {
  show(): boolean {
    if (this.user.isAdmin || this.user.isTravelDeskUser) {
      return true
    }

    return false
  }

  create(): boolean {
    if (this.user.isAdmin || this.user.isTravelDeskUser) {
      return true
    }

    return false
  }

  update(): boolean {
    if (this.user.isAdmin || this.user.isTravelDeskUser) {
      return true
    }

    return false
  }

  destroy(): boolean {
    if (this.user.isAdmin || this.user.isTravelDeskUser) {
      return true
    }

    return false
  }

  permittedAttributes(): Path[] {
    return ["agencyName", "agencyInfo", "contactName", "contactEmail", "contactPhoneNumber"]
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskTravelAgency>> {
    if (user.isAdmin || user.isTravelDeskUser) {
      return {} // all records
    }

    return NO_RECORDS_SCOPE
  }
}

export default TravelDeskTravelAgenciesPolicy
