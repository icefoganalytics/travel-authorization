import path from "path"

import { isNil } from "lodash"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { TravelAuthorizationPreApprovalDocument } from "@/models"
import { TravelAuthorizationPreApprovalDocumentsPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationPreApprovalDocumentsController extends BaseController<TravelAuthorizationPreApprovalDocument> {
  async create() {
    try {
      const travelAuthorizationPreApprovalDocument =
        await this.loadTravelAuthorizationPreApprovalDocument()
      if (isNil(travelAuthorizationPreApprovalDocument)) {
        return this.response.status(404).json({
          message: "Travel pre-approval document not found",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalDocument)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to download this travel pre-approval document.",
        })
      }

      const { name, mimeType, approvalDocument } = travelAuthorizationPreApprovalDocument
      const fileName = await this.buildFileName(name)
      return this.response
        .status(201)
        .header("Content-Type", mimeType)
        .attachment(fileName)
        .send(approvalDocument)
    } catch (error) {
      logger.error(`Error downloading travel authorization pre-approval document: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Failed to download travel authorization pre-approval document: ${error}`,
      })
    }
  }

  private async loadTravelAuthorizationPreApprovalDocument() {
    return TravelAuthorizationPreApprovalDocument.scope(["withDocument"]).findByPk(
      this.params.travelAuthorizationPreApprovalDocumentId,
      {
        include: ["submission"],
      }
    )
  }

  private buildPolicy(
    travelAuthorizationPreApprovalDocument: TravelAuthorizationPreApprovalDocument
  ) {
    return new TravelAuthorizationPreApprovalDocumentsPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalDocument
    )
  }

  private async buildFileName(documentName: string) {
    const date = DateTime.now().toFormat("yyyy-MM-dd")
    const extension = path.extname(documentName) || ".bin"
    const baseName = path.basename(documentName, extension)
    return `Approval Document, ${baseName}, ${date}${extension}`
  }
}

export default TravelAuthorizationPreApprovalDocumentsController
