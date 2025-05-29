import { TravelAuthorization } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class ExpenseClaimPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }
}

export default ExpenseClaimPolicy
