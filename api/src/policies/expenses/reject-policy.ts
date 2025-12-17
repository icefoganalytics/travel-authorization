import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"

import { Expense } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { TravelAuthorizations } from "@/policies"

export class RejectPolicy extends PolicyFactory(Expense) {
  create(): boolean {
    return this.expensePolicy.create()
  }

  permittedAttributesForCreate(): Path[] {
    return ["rejectionNote"]
  }

  private get expensePolicy() {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected expense to have pre-loaded travel authorization association")
    }

    return new TravelAuthorizations.ExpensePolicy(this.user, travelAuthorization)
  }
}

export default RejectPolicy
