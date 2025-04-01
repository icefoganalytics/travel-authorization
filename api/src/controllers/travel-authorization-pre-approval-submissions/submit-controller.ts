import { isNil } from "lodash"

import { TravelAuthorizationPreApprovalSubmission } from "@/models"
import { TravelAuthorizationPreApprovalSubmissionsPolicy } from "@/policies"
import { SubmitService } from "@/services/travel-authorization-pre-approval-submissions"

import BaseController from "@/controllers/base-controller"

export class SubmitController extends BaseController<TravelAuthorizationPreApprovalSubmission> {
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
          message: "You are not authorized to submit this travel pre-approval submission.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)

      const updatedTravelAuthorizationPreApprovalSubmission = await SubmitService.perform(
        travelAuthorizationPreApprovalSubmission,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalSubmission: updatedTravelAuthorizationPreApprovalSubmission,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to submit travel pre-approval submission: ${error}`,
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

export default SubmitController
