import { type Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApproval } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies/travel-authorization-pre-approval-profiles-policy"

export class ProfilePolicy extends PolicyFactory(TravelAuthorizationPreApproval) {
  create(): boolean {
    return TravelAuthorizationPreApprovalProfilesPolicy.canCreateForPreApproval(
      this.user,
      this.record
    )
  }

  permittedAttributesForCreate(): Path[] {
    return TravelAuthorizationPreApprovalProfilesPolicy.permittedAttributesForCreate()
  }
}

export default ProfilePolicy
