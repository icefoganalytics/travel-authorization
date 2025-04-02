import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
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
      throw new Error("Only draft submissions support pre-approval attachment.")
    }

    if (
      this.travelAuthorizationPreApproval.status !== TravelAuthorizationPreApproval.Statuses.DRAFT
    ) {
      throw new Error("Only draft pre-approvals support attachment to a submission.")
    }

    await this.travelAuthorizationPreApproval.update({
      submissionId: this.travelAuthorizationPreApprovalSubmission.id,
      status: TravelAuthorizationPreApproval.Statuses.SUBMITTED,
    })
    return
  }
}

export default CreateService
