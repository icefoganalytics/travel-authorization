import { Attributes } from "sequelize"
import { isNil, isEmpty } from "lodash"

import db, {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalDocument,
  TravelAuthorizationPreApprovalSubmission,
  User,
} from "@/models"

import BaseService from "@/services/base-service"

export type TravelAuthorizationPreApprovalDocumentAttributes = Omit<
  Partial<Attributes<TravelAuthorizationPreApprovalDocument>>,
  "mimetype"
>

export type TravelAuthorizationPreApprovalAttributes = Pick<
  Attributes<TravelAuthorizationPreApproval>,
  "id" | "status"
>

export type TravelAuthorizationPreApprovalSubmissionAttributes = Partial<
  Attributes<TravelAuthorizationPreApprovalSubmission>
> & {
  documentsAttributes?: TravelAuthorizationPreApprovalDocumentAttributes[]
  preApprovalsAttributes?: TravelAuthorizationPreApprovalAttributes[]
}

export class ApproveService extends BaseService {
  private _internalFileTypeFromBuffer: unknown

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
      TravelAuthorizationPreApprovalSubmission.Statuses.SUBMITTED
    ) {
      throw new Error(
        "Travel authorization pre-approval submission must be in submitted state to be approved."
      )
    }

    const { preApprovalsAttributes, documentsAttributes } = this.attributes

    if (isNil(documentsAttributes) || isEmpty(documentsAttributes)) {
      throw new Error("At least one document must be provided.")
    }

    if (isNil(preApprovalsAttributes) || isEmpty(preApprovalsAttributes)) {
      throw new Error("At least one pre-approval must be referenced.")
    }

    return db.transaction(async () => {
      await this.travelAuthorizationPreApprovalSubmission.update({
        ...this.attributes,
        approverId: this.currentUser.id,
        approvedAt: new Date(),
        status: TravelAuthorizationPreApprovalSubmission.Statuses.APPROVED,
      })

      await this.updateTravelAuthorizationPreApprovalsStatuses(
        this.travelAuthorizationPreApprovalSubmission.id,
        preApprovalsAttributes
      )

      await this.createTravelAuthorizationPreApprovalDocuments(
        this.travelAuthorizationPreApprovalSubmission.id,
        documentsAttributes
      )

      return this.travelAuthorizationPreApprovalSubmission
    })
  }

  private async updateTravelAuthorizationPreApprovalsStatuses(
    travelAuthorizationPreApprovalSubmissionId: number,
    preApprovals: TravelAuthorizationPreApprovalAttributes[]
  ): Promise<void> {
    for (const preApproval of preApprovals) {
      await TravelAuthorizationPreApproval.update(
        {
          status: preApproval.status,
        },
        {
          where: {
            id: preApproval.id,
            submissionId: travelAuthorizationPreApprovalSubmissionId,
          },
        }
      )
    }
  }

  private async createTravelAuthorizationPreApprovalDocuments(
    travelAuthorizationPreApprovalSubmissionId: number,
    documentsAttributes: TravelAuthorizationPreApprovalDocumentAttributes[]
  ): Promise<void> {
    for (const documentAttributes of documentsAttributes) {
      const {
        name,
        approvalDocument,
        approvalDocumentApproverName,
        approvalDocumentApprovedOn,
        sizeInBytes,
        md5,
      } = documentAttributes
      if (isNil(name)) {
        throw new Error("Name must be provided.")
      }

      if (isNil(approvalDocument)) {
        throw new Error("Approval document must be provided.")
      }

      if (isNil(approvalDocumentApproverName)) {
        throw new Error("Approval document approver name must be provided.")
      }

      if (isNil(approvalDocumentApprovedOn)) {
        throw new Error("Approval document approved on must be provided.")
      }

      if (isNil(sizeInBytes)) {
        throw new Error("Size in bytes must be provided.")
      }

      if (isNil(md5)) {
        throw new Error("MD5 must be provided.")
      }

      const mimeType = await this.safeMimeType(approvalDocument)
      await TravelAuthorizationPreApprovalDocument.create({
        submissionId: travelAuthorizationPreApprovalSubmissionId,
        name,
        approvalDocument,
        approvalDocumentApproverName,
        approvalDocumentApprovedOn,
        sizeInBytes,
        mimeType,
        md5,
      })
    }
  }

  private async safeMimeType(data: Buffer): Promise<string> {
    const fileTypeResult = await this.internalFileTypeFromBuffer(data)
    if (isNil(fileTypeResult)) {
      return "application/octet-stream"
    }

    return fileTypeResult.mime
  }

  private async internalFileTypeFromBuffer(buffer: Uint8Array | ArrayBuffer) {
    if (!isNil(this._internalFileTypeFromBuffer)) {
      return (this._internalFileTypeFromBuffer as typeof fileTypeFromBuffer)(buffer)
    }

    // NOTE: Required to make file-type work with typescript non-module
    // Switching file-type to .mts or package type "module" is not viable at the moment
    const { fileTypeFromBuffer } = await import("file-type")
    this._internalFileTypeFromBuffer = fileTypeFromBuffer

    return (this._internalFileTypeFromBuffer as typeof fileTypeFromBuffer)(buffer)
  }
}

export default ApproveService
