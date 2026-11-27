import { type Path } from "@/utils/deep-pick"
import { TravelAuthorizationPreApproval } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationPreApprovalsPolicy from "@/policies/travel-authorization-pre-approvals-policy"

export class ProfilePolicy extends PolicyFactory(TravelAuthorizationPreApproval) {
  create(): boolean {
    return this.travelAuthorizationPreApprovalPolicy.show()
  }

  update(): boolean {
    return this.travelAuthorizationPreApprovalPolicy.show()
  }

  destroy(): boolean {
    return this.travelAuthorizationPreApprovalPolicy.show()
  }

  permittedAttributesForCreate(): Path[] {
    return ["profileName", "department", "branch"]
  }

  private get travelAuthorizationPreApprovalPolicy(): TravelAuthorizationPreApprovalsPolicy {
    return new TravelAuthorizationPreApprovalsPolicy(this.user, this.record)
  }
}

export default ProfilePolicy
