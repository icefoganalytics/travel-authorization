import { Attributes } from "@sequelize/core"

import { TravelAuthorizationPreApprovalSubmission, User } from "@/models"

import BaseService from "@/services/base-service"

export type TravelAuthorizationPreApprovalSubmissionAttributes = Partial<
  Attributes<TravelAuthorizationPreApprovalSubmission>
>

export class SubmitService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
    protected attributes: TravelAuthorizationPreApprovalSubmissionAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalSubmission> {
    if (
      this.travelAuthorizationPreApprovalSubmission.status !==
      TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT
    ) {
      throw new Error(
        "Travel authorization pre-approval submission must be in draft state to be submitted."
      )
    }

    await this.travelAuthorizationPreApprovalSubmission.update({
      ...this.attributes,
      status: TravelAuthorizationPreApprovalSubmission.Statuses.SUBMITTED,
    })

    return this.travelAuthorizationPreApprovalSubmission
  }
}

export default SubmitService
