import { CreationAttributes, Op } from "@sequelize/core"

import { isEmpty, isNil } from "lodash"

import db, {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"
import BaseService from "@/services/base-service"

type TravelAuthorizationPreApprovalSubmissionCreationAttributes = Partial<
  CreationAttributes<TravelAuthorizationPreApprovalSubmission>
> & {
  preApprovalIds?: number[]
}

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationPreApprovalSubmissionCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorizationPreApprovalSubmission> {
    const { department, status, preApprovalIds, ...optionalAttributes } = this.attributes

    if (isNil(department)) {
      throw new Error("Department is required.")
    }

    if (isNil(preApprovalIds) || isEmpty(preApprovalIds)) {
      throw new Error("preApprovalIds must have at least one element.")
    }

    const statusOrDefault = status ?? TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT
    if (
      ![
        TravelAuthorizationPreApprovalSubmission.Statuses.DRAFT,
        TravelAuthorizationPreApprovalSubmission.Statuses.SUBMITTED,
      ].includes(statusOrDefault)
    ) {
      throw new Error("Status can only be DRAFT or SUBMITTED during creation.")
    }

    return db.transaction(async () => {
      const travelAuthorizationPreApprovalSubmission =
        await TravelAuthorizationPreApprovalSubmission.create({
          ...optionalAttributes,
          department,
          creatorId: this.currentUser.id,
          status: statusOrDefault,
        })

      await this.validatePreApprovalsHaveNotAlreadyBeenSubmitted(preApprovalIds)
      await this.markPreApprovalsAsSubmitted(
        travelAuthorizationPreApprovalSubmission.id,
        preApprovalIds
      )

      return travelAuthorizationPreApprovalSubmission
    })
  }

  private async validatePreApprovalsHaveNotAlreadyBeenSubmitted(
    preApprovalIds: number[]
  ): Promise<void> {
    const existingSubmissions = await TravelAuthorizationPreApproval.findAll({
      where: {
        id: preApprovalIds,
        submissionId: {
          [Op.not]: null,
        },
      },
    })

    if (!isEmpty(existingSubmissions)) {
      throw new Error("Pre-approvals have already been submitted.")
    }
  }

  private async markPreApprovalsAsSubmitted(
    travelAuthorizationPreApprovalSubmissionId: number,
    preApprovalIds: number[]
  ): Promise<void> {
    await TravelAuthorizationPreApproval.update(
      {
        submissionId: travelAuthorizationPreApprovalSubmissionId,
        status: TravelAuthorizationPreApproval.Statuses.SUBMITTED,
      },
      {
        where: {
          id: preApprovalIds,
        },
      }
    )
  }
}

export default CreateService
