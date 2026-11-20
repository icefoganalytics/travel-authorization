import { isNil } from "lodash"

import { type Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApproval } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies/travel-authorization-pre-approval-profiles-policy"

export class ProfilePolicy extends PolicyFactory(TravelAuthorizationPreApproval) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (isNil(this.record.department)) return false
    if (this.record.department === this.user.department) return true

    return false
  }

  update(): boolean {
    if (this.user.isAdmin) return true
    if (isNil(this.record.department)) return false
    if (this.record.department === this.user.department) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isAdmin) return true
    if (isNil(this.record.department)) return false
    if (this.record.department === this.user.department) return true

    return false
  }

  permittedAttributesForCreate(): Path[] {
    return TravelAuthorizationPreApprovalProfilesPolicy.permittedAttributesForCreate()
  }
}

export default ProfilePolicy
