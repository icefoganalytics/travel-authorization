import { Path } from "@/utils/deep-pick"

import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ExpenseClaimSubmittedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true

    return false
  }

  permittedAttributes(): Path[] {
    const attributes: Path[] = super.permittedAttributes()

    if (this.user.isAdmin || this.record.supervisorEmail === this.user.email) {
      attributes.push("supervisorEmail")
    }

    return attributes
  }
}

export default ExpenseClaimSubmittedStatePolicy
