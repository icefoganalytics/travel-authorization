import { Attributes, FindOptions, Op } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { Stop, User } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class StopPolicy extends PolicyFactory(Stop) {
  show(): boolean {
    return this.travelAuthorizationPolicy.show()
  }

  create(): boolean {
    return this.travelAuthorizationPolicy.update()
  }

  update(): boolean {
    return this.travelAuthorizationPolicy.update()
  }

  destroy(): boolean {
    return this.travelAuthorizationPolicy.update()
  }

  permittedAttributes(): Path[] {
    return ["locationId", "departureDate", "departureTime", "transport", "accommodationType"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["travelAuthorizationId", "isActual", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<Stop>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    return {
      include: [
        {
          association: "travelAuthorization",
          where: {
            [Op.or]: [
              {
                supervisorEmail: user.email,
              },
              {
                userId: user.id,
              },
            ],
          },
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

export default StopPolicy
