import { Path } from "@/utils/deep-pick"

import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ExpenseClaimSubmittedStatePolicy extends GenericStatePolicy {
  permittedAttributes(): Path[] {
    const attributes: Path[] = super.permittedAttributes()

    if (this.user.isAdmin || this.record.supervisorEmail === this.user.email) {
      attributes.push("supervisorEmail")
    }

    return attributes
  }
}

export default ExpenseClaimSubmittedStatePolicy
