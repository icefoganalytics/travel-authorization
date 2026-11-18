import { type Attributes, type WhereOptions } from "@sequelize/core"
import { type Response } from "express"
import { DateTime } from "luxon"

import logger from "@/utils/logger"

import { type TravelAuthorizationPreApproval, type User } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
import { TravelAuthorizationPreApprovalsPolicy } from "@/policies"
import { TravelAuthorizationPreApprovals } from "@/services/downloads"
import BaseController, { type ModelOrder } from "@/controllers/base-controller"

export class TravelAuthorizationPreApprovalsController extends BaseController<TravelAuthorizationPreApproval> {
  async create() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["updatedAt", "DESC"],
        ["id", "ASC"],
      ])
      const scopedTravelAuthorizationPreApprovals =
        TravelAuthorizationPreApprovalsPolicy.applyScope(scopes, this.currentUser)

      if (this.query.format === "csv") {
        return await this.respondWithCsv(
          this.response,
          scopedTravelAuthorizationPreApprovals,
          where,
          order,
          this.currentUser
        )
      } else {
        return this.response.status(422).json({
          message: "Unsupported report format",
        })
      }
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
    response: Response,
    scopedTravelAuthorizationPreApprovals: BaseModelConstructor<TravelAuthorizationPreApproval>,
    where: WhereOptions<Attributes<TravelAuthorizationPreApproval>>,
    order: ModelOrder[] | undefined,
    currentUser: User
  ) {
    const fileName = this.buildFileName()
    response.status(200).attachment(fileName)
    response.setHeader("Content-Type", "text/csv; charset=utf-8")

    return TravelAuthorizationPreApprovals.CreateCsvService.perform(
      response,
      scopedTravelAuthorizationPreApprovals,
      where,
      order,
      currentUser
    )
  }

  private buildFileName(): string {
    const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

    return `Export, Travel Pre-Approval Requests, ${timestamp}.csv`
  }
}

export default TravelAuthorizationPreApprovalsController
