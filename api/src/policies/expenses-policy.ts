import { isUndefined } from "lodash"

import { Expense, User } from "@/models"
import BasePolicy from "@/policies/base-policy"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class ExpensesPolicy extends BasePolicy<Expense> {
  constructor(user: User, record: Expense) {
    super(user, record)
  }

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

  private get travelAuthorizationPolicy(): TravelAuthorizationsPolicy {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected record to have pre-loaded travel authorization association")
    }

    return new TravelAuthorizationsPolicy(this.user, travelAuthorization)
  }
}

export default ExpensesPolicy
