import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { User, TravelAllowance } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class TravelAllowancesPolicy extends PolicyFactory(TravelAllowance) {
  show(): boolean {
    return true
  }

  update(): boolean {
    if (this.user.roles.includes(User.Roles.ADMIN)) return true

    return false
  }

  permittedAttributes(): Path[] {
    return ["amount"]
  }

  static policyScope(_user: User): FindOptions<Attributes<TravelAllowance>> {
    return {}
  }
}

export default TravelAllowancesPolicy
