import { FindOptions, Attributes, Op } from "@sequelize/core"
import { isUndefined } from "lodash"

import { GeneralLedgerCoding, User } from "@/models"

import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class GeneralLedgerCodingsPolicy extends PolicyFactory(GeneralLedgerCoding) {
  create(): boolean {
    if (this.travelAuthorizationPolicy.update()) return true

    return false
  }

  update(): boolean {
    if (this.travelAuthorizationPolicy.update()) return true

    return false
  }

  destroy(): boolean {
    if (this.travelAuthorizationPolicy.update()) return true

    return false
  }

  permittedAttributes(): string[] {
    return ["code", "amount"]
  }

  permittedAttributesForCreate(): string[] {
    return ["travelAuthorizationId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<GeneralLedgerCoding>> {
    if (user.isAdmin) {
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

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected record to have pre-loaded travelAuthorization association")
    }

    return new TravelAuthorizationsPolicy(this.user, travelAuthorization)
  }
}

export default GeneralLedgerCodingsPolicy
