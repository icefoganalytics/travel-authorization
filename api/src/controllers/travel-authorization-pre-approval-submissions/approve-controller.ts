import { isNil, isEmpty, isArray } from "lodash"

import { TravelAuthorizationPreApprovalSubmission } from "@/models"
import { TravelAuthorizationPreApprovalSubmissionsPolicy } from "@/policies"
import { ApproveService } from "@/services/travel-authorization-pre-approval-submissions"

import BaseController from "@/controllers/base-controller"

export class ApproveController extends BaseController<TravelAuthorizationPreApprovalSubmission> {
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
          message: "You are not authorized to approve this travel pre-approval submission.",
        })
      }

      if (
        isNil(this.request.files) ||
        isEmpty(this.request.files) ||
        isNil(this.request.files.file)
      ) {
        return this.response.status(400).json({
          message: "No files were uploaded.",
        })
      } else if (isArray(this.request.files.file)) {
        return this.response.status(422).json({
          message: "Only one file can be uploaded at a time.",
        })
      } else if (this.request.files.file.truncated) {
        return this.response.status(413).json({
          message: "The file is too large.",
        })
      }

      const { file } = this.request.files
      const { name, data, size, mimetype, md5 } = file
      const documentsAttributes = [
        {
          name,
          data,
          size,
          mimetype,
          md5,
        },
      ]

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelAuthorizationPreApprovalSubmission = await ApproveService.perform(
        travelAuthorizationPreApprovalSubmission,
        {
          ...permittedAttributes,
          documentsAttributes,
        },
        this.currentUser
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalSubmission: updatedTravelAuthorizationPreApprovalSubmission,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to approve travel pre-approval submission: ${error}`,
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

export default ApproveController
