import db, {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    if (
      this.travelAuthorizationPreApprovalSubmission.status !==
      TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT
    ) {
      throw new Error("Only draft submissions can be deleted.")
    }

    return db.transaction(async () => {
      await this.detachLinkedPreApprovalRequests(this.travelAuthorizationPreApprovalSubmission.id)
      await this.travelAuthorizationPreApprovalSubmission.destroy()
      return
    })
  }

  private async detachLinkedPreApprovalRequests(
    travelAuthorizationPreApprovalSubmissionId: number
  ): Promise<void> {
    await TravelAuthorizationPreApproval.update(
      {
        submissionId: null,
        status: TravelAuthorizationPreApproval.Statuses.DRAFT,
      },
      {
        where: {
          submissionId: travelAuthorizationPreApprovalSubmissionId,
        },
      }
    )
  }
}

export default DestroyService
