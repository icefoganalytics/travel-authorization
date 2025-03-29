import db, { TravelAuthorizationPreApprovalSubmission, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelAuthorizationPreApprovalSubmission> & {
  documentsAttributes?: {
    name: string
    data: Buffer
    size: number
    mimetype: string
    md5: string
  }[]
}

export class ApproveService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
    protected attributes: Attributes,
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
        "Travel authorization pre-approval submission must be in submitted state to be approved."
      )
    }

    return db.transaction(async () => {
      await this.travelAuthorizationPreApprovalSubmission.update({
        ...this.attributes,
        status: TravelAuthorizationPreApprovalSubmission.Statuses.FINISHED,
      })

      // TODO: save document

      return this.travelAuthorizationPreApprovalSubmission
    })
  }
}

export default ApproveService
