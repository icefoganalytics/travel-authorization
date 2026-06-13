import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ExpenseClaimSupervisorChangesRequestedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true

    return false
  }
}

export default ExpenseClaimSupervisorChangesRequestedStatePolicy
