import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { User, PerDiem } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class PerDiemsPolicy extends PolicyFactory(PerDiem) {
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

  static policyScope(_user: User): FindOptions<Attributes<PerDiem>> {
    return {}
  }
}

export default PerDiemsPolicy
