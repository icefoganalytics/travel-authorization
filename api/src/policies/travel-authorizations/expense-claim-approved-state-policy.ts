import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ExpenseClaimApprovedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.user.isFinanceUser && this.user.department === this.record.department) return true

    return false
  }
}

export default ExpenseClaimApprovedStatePolicy
