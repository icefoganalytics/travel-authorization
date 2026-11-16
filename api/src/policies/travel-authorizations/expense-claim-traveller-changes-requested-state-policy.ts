import { Path } from "@/utils/deep-pick"

import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"

export class ExpenseClaimTravellerChangesRequestedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  permittedAttributes(): Path[] {
    const attributes: Path[] = super.permittedAttributes()

    if (this.user.isAdmin || this.record.userId === this.user.id) {
      attributes.push("actualPrimaryDestinationId")
    }

    return attributes
  }
}

export default ExpenseClaimTravellerChangesRequestedStatePolicy
