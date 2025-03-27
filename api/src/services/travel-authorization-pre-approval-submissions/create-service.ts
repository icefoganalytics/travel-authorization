import { CreationAttributes } from "sequelize"

import { isNil } from "lodash"

import { TravelAuthorizationPreApprovalSubmission, User } from "@/models"
import BaseService from "@/services/base-service"

type TravelAuthorizationPreApprovalSubmissionCreationAttributes = Partial<
  CreationAttributes<TravelAuthorizationPreApprovalSubmission>
>

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationPreApprovalSubmissionCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalSubmission> {
    const { department, ...optionalAttributes } = this.attributes

    if (isNil(department)) {
      throw new Error("Department is required.")
    }

    const travelAuthorizationPreApprovalSubmission =
      await TravelAuthorizationPreApprovalSubmission.create({
        ...optionalAttributes,
        department,
        creatorId: this.currentUser.id,
        status: TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT,
      })

    return travelAuthorizationPreApprovalSubmission
  }
}

export default CreateService
