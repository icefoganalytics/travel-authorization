import BasePolicy from "@/policies/base-policy"

import { TravelAuthorization } from "@/models"

export class ExpenseClaimPolicy extends BasePolicy<TravelAuthorization> {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }
}

export default ExpenseClaimPolicy
