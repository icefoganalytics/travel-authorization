import { FindOptions, Attributes, Op } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Expense, TravelAuthorization, User } from "@/models"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"
import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"

export class ExpensesPolicy extends PolicyFactory(Expense) {
  show(): boolean {
    if (this.travelAuthorizationPolicy.show()) return true

    return false
  }

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
    return ["description", "date", "cost", "expenseType"]
  }

  permittedAttributesForCreate(): string[] {
    return ["travelAuthorizationId", "type", "currency", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<Expense>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    if (user.isFinanceUser) {
      return {
        include: [
          {
            association: "travelAuthorization",
            where: {
              [Op.or]: [
                {
                  department: user.department,
                },
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

  private get travelAuthorization(): TravelAuthorization {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected record to have pre-loaded travel authorization association")
    }

    return travelAuthorization
  }

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy {
    return new TravelAuthorizationsPolicy(this.user, this.travelAuthorization)
  }
}

export default ExpensesPolicy
