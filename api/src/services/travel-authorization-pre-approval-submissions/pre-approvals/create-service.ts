import { Attributes } from "sequelize"
import { isNil } from "lodash"

import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import BaseService from "@/services/base-service"

export type TravelAuthorizationPreApprovalAttributes = Partial<
  Attributes<TravelAuthorizationPreApproval>
>

export class CreateService extends BaseService {
  constructor(
    protected travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission,
    protected attributes: TravelAuthorizationPreApprovalAttributes,
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

    const { id } = this.attributes
    if (isNil(id)) {
      throw new Error("Pre-approval ID is required.")
    }

    await TravelAuthorizationPreApproval.update(
      {
        submissionId: this.travelAuthorizationPreApprovalSubmission.id,
        status: TravelAuthorizationPreApproval.Statuses.SUBMITTED,
      },
      {
        where: {
          id,
        },
      }
    )
    return
  }
}

export default CreateService
