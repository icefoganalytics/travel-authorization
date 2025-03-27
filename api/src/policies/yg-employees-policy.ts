import { Attributes, FindOptions } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { YgEmployee, User } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class YgEmployeesPolicy extends PolicyFactory(YgEmployee) {
  show(): boolean {
    return true
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
    if (this.user.isAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    return []
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }

  static policyScope(_user: User): FindOptions<Attributes<YgEmployee>> {
    return ALL_RECORDS_SCOPE
  }
}

export default YgEmployeesPolicy
