import { TravelAuthorizationPreApprovalSubmission, User } from "@/models"

import BaseService from "@/services/base-service"

export class RevertToDraftService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalSubmission> {
    if (
      this.travelAuthorizationPreApprovalSubmission.status !==
      TravelAuthorizationPreApprovalSubmission.Statuses.SUBMITTED
    ) {
      throw new Error(
        "Travel authorization pre-approval submission must be in submitted state to be reverted to draft."
      )
    }

    await this.travelAuthorizationPreApprovalSubmission.update({
      status: TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT,
    })

    return this.travelAuthorizationPreApprovalSubmission
  }
}

export default RevertToDraftService
