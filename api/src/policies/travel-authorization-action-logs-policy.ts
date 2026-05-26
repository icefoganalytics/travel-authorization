import { Attributes, FindOptions } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"

import { User, TravelAuthorizationActionLog } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class TravelAuthorizationActionLogsPolicy extends PolicyFactory(
  TravelAuthorizationActionLog
) {
  show(): boolean {
    return this.travelAuthorizationPolicy.show()
  }

  permittedAttributes(): Path[] {
    return []
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorizationActionLog>> {
    return {
      include: [
        {
          association: "travelAuthorization",
          ...TravelAuthorizationsPolicy.policyScope(user),
          required: true,
        },
      ],
    }
  }

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Record must have pre-loaded travel authorization association")
    }

    return new TravelAuthorizationsPolicy(this.user, travelAuthorization)
  }
}

export default TravelAuthorizationActionLogsPolicy
