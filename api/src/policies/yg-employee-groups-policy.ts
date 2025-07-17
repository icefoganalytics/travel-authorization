import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { YgEmployeeGroup, User } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class YgEmployeeGroupsPolicy extends PolicyFactory(YgEmployeeGroup) {
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

  static policyScope(_user: User): FindOptions<Attributes<YgEmployeeGroup>> {
    return ALL_RECORDS_SCOPE
  }
}

export default YgEmployeeGroupsPolicy
