import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { TravelDeskProductType, User } from "@/models"
import { NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

const BUILT_IN_PRODUCT_TYPE_CODES = ["air", "service-fee", "credit", "change-fee"]

export class TravelDeskProductTypesPolicy extends PolicyFactory(TravelDeskProductType) {
  show(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }

  create(): boolean {
    return this.user.isAdmin
  }

  update(): boolean {
    return this.user.isAdmin
  }

  destroy(): boolean {
    return this.user.isAdmin && !BUILT_IN_PRODUCT_TYPE_CODES.includes(this.record.code)
  }

  permittedAttributes(): Path[] {
    return ["name", "description"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["code", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskProductType>> {
    if (user.isAdmin || user.isTravelDeskUser) {
      return {}
    }

    return NO_RECORDS_SCOPE
  }
}

export default TravelDeskProductTypesPolicy
