import { Attributes, FindOptions, Op } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { TravelAuthorization, TravelSegment, User } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class TravelSegmentsPolicy extends PolicyFactory(TravelSegment) {
  show(): boolean {
    return this.travelAuthorizationPolicy.show()
  }

  create(): boolean {
    if (this.isReturnedExpenseClaim) return false

    return this.travelAuthorizationPolicy.update()
  }

  update(): boolean {
    if (this.isReturnedExpenseClaim) return false

    return this.travelAuthorizationPolicy.update()
  }

  destroy(): boolean {
    if (this.isReturnedExpenseClaim) return false

    return this.travelAuthorizationPolicy.update()
  }

  permittedAttributes(): Path[] {
    return [
      "departureLocationId",
      "arrivalLocationId",
      "segmentNumber",
      "departureOn",
      "departureTime",
      "modeOfTransport",
      "modeOfTransportOther",
      "accommodationType",
      "accommodationTypeOther",
    ]
  }

  permittedAttributesForUpdate(): Path[] {
    return this.permittedAttributes()
  }

  permittedAttributesForCreate(): Path[] {
    return ["travelAuthorizationId", "isActual", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelSegment>> {
    if (user.roles.includes(User.Roles.ADMIN)) {
      return ALL_RECORDS_SCOPE
    }

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

  private get isReturnedExpenseClaim(): boolean {
    return (
      this.record.travelAuthorization?.status ===
      TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED
    )
  }

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Record must have pre-loaded travel authorization association")
    }

    return new TravelAuthorizationsPolicy(this.user, travelAuthorization)
  }
}

export default TravelSegmentsPolicy
