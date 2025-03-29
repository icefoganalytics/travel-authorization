import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorizationPreApprovalSubmission } from "@/models"
import { TravelAuthorizationPreApprovalSubmissionsPolicy } from "@/policies"
import { CreateService } from "@/services/travel-authorization-pre-approval-submissions"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationPreApprovalSubmissionsController extends BaseController<TravelAuthorizationPreApprovalSubmission> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["updatedAt", "DESC"]])

      const scopedTravelAuthorizationPreApprovalSubmissions =
        TravelAuthorizationPreApprovalSubmissionsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelAuthorizationPreApprovalSubmissions.count({ where })
      const travelAuthorizationPreApprovalSubmissions =
        await scopedTravelAuthorizationPreApprovalSubmissions.findAll({
          where,
          limit: this.pagination.limit,
          offset: this.pagination.offset,
          order,
          include: [
            {
              association: "preApprovals",
              include: ["profiles"],
            },
          ],
        })
      return this.response.json({
        travelAuthorizationPreApprovalSubmissions,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorization pre-approval submissions: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorization pre-approval submissions: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelAuthorizationPreApprovalSubmission =
        await this.loadTravelAuthorizationPreApprovalSubmission()
      if (isNil(travelAuthorizationPreApprovalSubmission)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval submission not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalSubmission)
      if (!policy.show()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to view this travel authorization pre-approval submission.",
        })
      }

      return this.response.status(200).json({
        travelAuthorizationPreApprovalSubmission,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorization pre-approval submission: ${error}`, {
        error,
      })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorization pre-approval submission: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to create travel authorization pre-approval submissions.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelAuthorizationPreApprovalSubmission = CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({
        travelAuthorizationPreApprovalSubmission,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to create travel authorization pre-approval submission: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelAuthorizationPreApprovalSubmission =
        await this.loadTravelAuthorizationPreApprovalSubmission()
      if (isNil(travelAuthorizationPreApprovalSubmission)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval submission not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalSubmission)
      if (!policy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to update this travel authorization pre-approval submission.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      await travelAuthorizationPreApprovalSubmission.update(permittedAttributes)
      return this.response.status(200).json({
        travelAuthorizationPreApprovalSubmission,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel authorization pre-approval submission: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Failed to update travel authorization pre-approval submission: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelAuthorizationPreApprovalSubmission =
        await this.loadTravelAuthorizationPreApprovalSubmission()
      if (isNil(travelAuthorizationPreApprovalSubmission)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval submission not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalSubmission)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to delete this travel authorization pre-approval submission.",
        })
      }

      await travelAuthorizationPreApprovalSubmission.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel authorization pre-approval submission: ${error}`, {
        error,
      })
      return this.response.status(422).json({
        message: `Failed to delete travel authorization pre-approval submission: ${error}`,
      })
    }
  }

  private async loadTravelAuthorizationPreApprovalSubmission() {
    return await TravelAuthorizationPreApprovalSubmission.findByPk(
      this.params.travelAuthorizationPreApprovalSubmissionId,
      {
        include: [
          {
            association: "preApprovals",
            include: ["profiles"],
          },
        ],
      }
    )
  }

  private buildPolicy(
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission = TravelAuthorizationPreApprovalSubmission.build()
  ) {
    return new TravelAuthorizationPreApprovalSubmissionsPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalSubmission
    )
  }
}

export default TravelAuthorizationPreApprovalSubmissionsController
