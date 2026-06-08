import { TravelAuthorization } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class RequestExpenseClaimChangesPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.user.isFinanceUser && this.user.department === this.record.department) return true

    return false
  }
}

export default RequestExpenseClaimChangesPolicy
