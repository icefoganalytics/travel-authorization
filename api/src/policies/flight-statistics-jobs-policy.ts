import { Attributes, FindOptions } from "@sequelize/core"

import { FlightStatisticJob, User } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"

export class FlightStatisticsJobsPolicy extends PolicyFactory(FlightStatisticJob) {
  show(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  create(): boolean {
    if (this.user.isAdmin) return true

    return false
  }

  destroy(): boolean {
    return false
  }

  static policyScope(user: User): FindOptions<Attributes<FlightStatisticJob>> {
    if (user.isAdmin) {
      return ALL_RECORDS_SCOPE
    }

    return NO_RECORDS_SCOPE
  }
}

export default FlightStatisticsJobsPolicy
