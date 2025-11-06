import { Attributes, FindOptions } from "@sequelize/core"

import { FlightStatistic, User } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"

export class FlightStatisticsPolicy extends PolicyFactory(FlightStatistic) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  create(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  destroy(): boolean {
    return false
  }

  static policyScope(user: User): FindOptions<Attributes<FlightStatistic>> {
    if (user.isAdmin) {
      return ALL_RECORDS_SCOPE
    }

    return NO_RECORDS_SCOPE
  }
}

export default FlightStatisticsPolicy
