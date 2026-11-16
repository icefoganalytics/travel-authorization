import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { type TravelAuthorizationPreApproval } from "@/models"
import { TravelAuthorizationPreApprovalsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"
import BaseController, { type ModelOrder } from "@/controllers/base-controller"

const CSV_BYTE_ORDER_MARK = Buffer.from("\uFEFF")

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
      return await this.respondWithCsv(scopedTravelAuthorizationPreApprovals, where, order)
    } catch (error) {
      logger.error(`Failed to create travel authorization pre-approvals download: ${error}`, {
        error,
      })

      if (this.response.headersSent) {
        this.response.destroy()
        return
      }

      return this.response.status(422).json({
        message: "Failed to create travel authorization pre-approvals download",
      })
    }
  }

  private async respondWithCsv(
    scopedTravelAuthorizationPreApprovals: ModelStatic<TravelAuthorizationPreApproval>,
    where: WhereOptions<Attributes<TravelAuthorizationPreApproval>>,
    order: ModelOrder[] | undefined
  ) {
    const fileName = this.buildFileName()
    this.response.status(200).attachment(fileName)
    this.response.setHeader("Content-Type", "text/csv; charset=utf-8")
    this.response.flushHeaders()
    this.response.write(CSV_BYTE_ORDER_MARK)

    const fileBuffer = await CreateCsvService.perform(
      scopedTravelAuthorizationPreApprovals,
      where,
      order,
      this.currentUser
    )

    // The service includes the byte-order mark already sent to start the download.
    return this.response.end(fileBuffer.subarray(CSV_BYTE_ORDER_MARK.length))
  }

  private buildFileName(): string {
    const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

    return `Export, Travel Pre-Approval Requests, ${timestamp}.csv`
  }
}

export default TravelAuthorizationPreApprovalsController
