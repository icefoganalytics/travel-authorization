import { Path } from "@/utils/deep-pick"

import { TravelAuthorization } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class ApprovePolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true

    return false
  }

  permittedAttributesForCreate(): Path[] {
    return []
  }
}

export default ApprovePolicy
