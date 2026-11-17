import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ExpenseClaimTravellerChangesRequestedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }
}

export default ExpenseClaimTravellerChangesRequestedStatePolicy
