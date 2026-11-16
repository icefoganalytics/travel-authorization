import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { type TravelAuthorizationPreApproval } from "@/models"
import { TravelAuthorizationPreApprovalsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationPreApprovalsController extends BaseController<TravelAuthorizationPreApproval> {
  async create() {
    try {
      if (this.query.format !== "csv") {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }

      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["updatedAt", "DESC"]])
      const scopedTravelAuthorizationPreApprovals =
        TravelAuthorizationPreApprovalsPolicy.applyScope(scopes, this.currentUser)
      const fileBuffer = await CreateCsvService.perform(
        scopedTravelAuthorizationPreApprovals,
        where,
        order,
        this.currentUser
      )

      const fileName = this.buildFileName()

      this.response.attachment(fileName)
      this.response.setHeader("Content-Type", "text/csv; charset=utf-8")

      return this.response.status(200).send(fileBuffer)
    } catch (error) {
      logger.error(`Failed to create travel authorization pre-approvals download: ${error}`, {
        error,
      })

      return this.response.status(422).json({
        message: "Failed to create travel authorization pre-approvals download",
      })
    }
  }

  private buildFileName(): string {
    const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

    return `Export, Travel Pre-Approval Requests, ${timestamp}.csv`
  }
}

export default TravelAuthorizationPreApprovalsController
