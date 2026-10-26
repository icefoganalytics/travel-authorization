import { type Attributes, type FindOptions, type ModelStatic } from "@sequelize/core"

import { TravelAuthorization, User } from "@/models"
import BasePolicy, { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import { type BaseScopeOptions } from "@/policies/policy-factory"

const POLICY_SCOPE_NAME = "travelDeskTravelAuthorizationsPolicyScope"

export class TravelDeskTravelAuthorizationsPolicy extends BasePolicy<TravelAuthorization> {
  static policyScope(user: User): FindOptions<Attributes<TravelAuthorization>> {
    if (user.roles.includes(User.Roles.ADMIN)) return ALL_RECORDS_SCOPE

    return {
      where: {
        userId: user.id,
      },
    }
  }

  static applyScope(scopes: BaseScopeOptions[], user: User): ModelStatic<TravelAuthorization> {
    // Keep this owner-only collection separate from supervisor/finance authorization visibility.
    if (
      !Object.prototype.hasOwnProperty.call(TravelAuthorization.options.scopes, POLICY_SCOPE_NAME)
    ) {
      TravelAuthorization.addScope(POLICY_SCOPE_NAME, this.policyScope)
    }

    return TravelAuthorization.withScope([...scopes, { method: [POLICY_SCOPE_NAME, user] }])
  }
}

export default TravelDeskTravelAuthorizationsPolicy
