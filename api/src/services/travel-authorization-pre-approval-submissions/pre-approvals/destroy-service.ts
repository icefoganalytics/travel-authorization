import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
    protected travelAuthorizationPreApproval: TravelAuthorizationPreApproval,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    if (
      this.travelAuthorizationPreApprovalSubmission.status !==
      TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT
    ) {
      throw new Error("Only draft submissions support pre-approval detachment.")
    }

    await this.travelAuthorizationPreApproval.update({
      submissionId: null,
      status: TravelAuthorizationPreApproval.Statuses.DRAFT,
    })
    return
  }
}

export default DestroyService
