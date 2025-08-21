import { readFileSync } from "fs"

import { isNil, isEmpty, isArray, merge } from "lodash"
import { type UploadedFile } from "express-fileupload"

import { TravelAuthorizationPreApprovalSubmission } from "@/models"
import { TravelAuthorizationPreApprovalSubmissionsPolicy } from "@/policies"
import { ApproveService } from "@/services/travel-authorization-pre-approval-submissions"
import { type TravelAuthorizationPreApprovalDocumentAttributes } from "@/services/travel-authorization-pre-approval-submissions/approve-service"

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

      const { files } = this.request
      if (isNil(files) || isEmpty(files)) {
        return this.response.status(400).json({
          message: "No files were uploaded.",
        })
      }
      const approvalDocument = files["documentsAttributes[0][approvalDocument]"]
      if (isArray(approvalDocument)) {
        return this.response.status(422).json({
          message: "Only one file can be uploaded at a time.",
        })
      } else if (approvalDocument.truncated) {
        return this.response.status(413).json({
          message: "The file is too large.",
        })
      }

      const documentsAttributes = await this.buildDocumentsAttributes(approvalDocument)
      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const permittedAttributesWithFile = merge({}, permittedAttributes, { documentsAttributes })

      const updatedTravelAuthorizationPreApprovalSubmission = await ApproveService.perform(
        travelAuthorizationPreApprovalSubmission,
        permittedAttributesWithFile,
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

  private async buildDocumentsAttributes(
    file: UploadedFile
  ): Promise<TravelAuthorizationPreApprovalDocumentAttributes[]> {
    const { name, md5, tempFilePath } = file

    const approvalDocument = readFileSync(tempFilePath)
    const size = approvalDocument.length

    const documentsAttributes: TravelAuthorizationPreApprovalDocumentAttributes[] = [
      {
        name,
        approvalDocument,
        sizeInBytes: size,
        md5,
      },
    ]
    return documentsAttributes
  }
}

export default ApproveController
