import { Path } from "@/utils/deep-pick"

import { TravelAuthorization } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class ExpensePolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.user.isFinanceUser && this.user.department === this.record.department) return true

    return false
  }

  permittedAttributesForCreate(): Path[] {
    return []
  }
}

export default ExpensePolicy
