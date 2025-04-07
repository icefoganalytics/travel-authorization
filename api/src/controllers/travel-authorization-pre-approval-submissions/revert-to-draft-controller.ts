import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorizationPreApprovalSubmission } from "@/models"
import { TravelAuthorizationPreApprovalSubmissionsPolicy } from "@/policies"
import { RevertToDraftService } from "@/services/travel-authorization-pre-approval-submissions"

import BaseController from "@/controllers/base-controller"

export class RevertToDraftController extends BaseController<TravelAuthorizationPreApprovalSubmission> {
  async create() {
    try {
      const travelAuthorizationPreApprovalSubmission =
        await this.loadTravelAuthorizationPreApprovalSubmission()
      if (isNil(travelAuthorizationPreApprovalSubmission)) {
        return this.response.status(404).json({
          message: "Travel pre-approval submission not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalSubmission)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to revert this travel pre-approval submission.",
        })
      }

      const updatedTravelAuthorizationPreApprovalSubmission = await RevertToDraftService.perform(
        travelAuthorizationPreApprovalSubmission,
        this.currentUser
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalSubmission: updatedTravelAuthorizationPreApprovalSubmission,
      })
    } catch (error) {
      logger.error(`Error reverting travel pre-approval submission: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to revert travel pre-approval submission: ${error}`,
      })
    }
  }

  private async loadTravelAuthorizationPreApprovalSubmission(): Promise<TravelAuthorizationPreApprovalSubmission | null> {
    return TravelAuthorizationPreApprovalSubmission.findByPk(
      this.params.travelAuthorizationPreApprovalSubmissionId
    )
  }

  private buildPolicy(
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
  ): TravelAuthorizationPreApprovalSubmissionsPolicy {
    return new TravelAuthorizationPreApprovalSubmissionsPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalSubmission
    )
  }
}

export default RevertToDraftController
