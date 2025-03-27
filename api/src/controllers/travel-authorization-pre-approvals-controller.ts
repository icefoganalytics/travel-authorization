import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorizationPreApproval } from "@/models"
import { TravelAuthorizationPreApprovalsPolicy } from "@/policies"
import { CreateService } from "@/services/travel-authorization-pre-approvals"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationPreApprovalsController extends BaseController<TravelAuthorizationPreApproval> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["updatedAt", "DESC"]])

      const scopedTravelAuthorizationPreApprovals =
        TravelAuthorizationPreApprovalsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelAuthorizationPreApprovals.count({ where })
      const travelAuthorizationPreApprovals = await scopedTravelAuthorizationPreApprovals.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        include: ["profiles"],
      })
      return this.response.json({
        travelAuthorizationPreApprovals,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorization pre-approvals: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorization pre-approvals: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApproval)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel authorization pre-approval.",
        })
      }

      return this.response.status(200).json({
        travelAuthorizationPreApproval,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorization pre-approval: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorization pre-approval: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel authorization pre-approvals.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelAuthorizationPreApproval = CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({
        travelAuthorizationPreApproval,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to create travel authorization pre-approval: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApproval)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel authorization pre-approval.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      await travelAuthorizationPreApproval.update(permittedAttributes)
      return this.response.status(200).json({
        travelAuthorizationPreApproval,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel authorization pre-approval: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel authorization pre-approval: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApproval)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel authorization pre-approval.",
        })
      }

      await travelAuthorizationPreApproval.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel authorization pre-approval: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to delete travel authorization pre-approval: ${error}`,
      })
    }
  }

  private async loadTravelAuthorizationPreApproval() {
    return await TravelAuthorizationPreApproval.findByPk(
      this.params.travelAuthorizationPreApprovalId,
      {
        include: ["submission"],
      }
    )
  }

  private buildPolicy(
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval = this.buildTravelAuthorizationPreApproval()
  ) {
    return new TravelAuthorizationPreApprovalsPolicy(
      this.currentUser,
      travelAuthorizationPreApproval
    )
  }

  private buildTravelAuthorizationPreApproval() {
    return TravelAuthorizationPreApproval.build(this.request.body)
  }
}

export default TravelAuthorizationPreApprovalsController
