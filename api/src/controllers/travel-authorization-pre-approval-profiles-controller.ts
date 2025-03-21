import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelAuthorizationPreApprovalProfile } from "@/models"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"
import { CreateService } from "@/services/travel-authorization-pre-approval-profiles"
import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationPreApprovalProfilesController extends BaseController<TravelAuthorizationPreApprovalProfile> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["createdAt", "DESC"]])

      const scopedTravelAuthorizationPreApprovalProfiles =
        TravelAuthorizationPreApprovalProfilesPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelAuthorizationPreApprovalProfiles.count({ where })
      const travelAuthorizationPreApprovalProfiles =
        await scopedTravelAuthorizationPreApprovalProfiles.findAll({
          where,
          limit: this.pagination.limit,
          offset: this.pagination.offset,
          order,
          include: ["preApproval"],
        })
      return this.response.status(200).json({
        travelAuthorizationPreApprovalProfiles,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorization pre-approval profiles: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching travel authorization pre-approval profiles: ${error}`,
      })
    }
  }

  async show() {
    const travelAuthorizationPreApprovalProfile =
      await this.loadTravelAuthorizationPreApprovalProfile()
    if (isNil(travelAuthorizationPreApprovalProfile)) {
      return this.response.status(404).json({
        message: "Travel Authorization Pre-Approval Profile not found",
      })
    }

    const policy = this.buildPolicy(travelAuthorizationPreApprovalProfile)
    if (!policy.show()) {
      return this.response.status(403).json({
        message: "You are not authorized to view this travel authorization pre-approval profile.",
      })
    }

    return this.response.status(200).json({
      travelAuthorizationPreApprovalProfile,
      policy,
    })
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel authorization pre-approval profiles.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelAuthorizationPreApprovalProfile = CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalProfile,
      })
    } catch (error) {
      logger.error(`Error creating travel authorization pre-approval profile: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to create travel authorization pre-approval profile: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelAuthorizationPreApprovalProfile =
        await this.loadTravelAuthorizationPreApprovalProfile()
      if (isNil(travelAuthorizationPreApprovalProfile)) {
        return this.response.status(404).json({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalProfile)
      if (!policy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      await travelAuthorizationPreApprovalProfile.update(permittedAttributes)
      return this.response.status(200).json({
        travelAuthorizationPreApprovalProfile,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel authorization pre-approval profile: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel authorization pre-approval profile: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelAuthorizationPreApprovalProfile =
        await this.loadTravelAuthorizationPreApprovalProfile()
      if (isNil(travelAuthorizationPreApprovalProfile)) {
        return this.response.status(404).json({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalProfile)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to delete this travel authorization pre-approval profile.",
        })
      }

      await travelAuthorizationPreApprovalProfile.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting travel authorization pre-approval profile: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to delete travel authorization pre-approval profile: ${error}`,
      })
    }
  }

  async loadTravelAuthorizationPreApprovalProfile() {
    return TravelAuthorizationPreApprovalProfile.findByPk(
      this.params.travelAuthorizationPreApprovalId,
      {
        include: ["preApproval"],
      }
    )
  }

  private buildPolicy(
    travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile = TravelAuthorizationPreApprovalProfile.build()
  ) {
    return new TravelAuthorizationPreApprovalProfilesPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalProfile
    )
  }
}

export default TravelAuthorizationPreApprovalProfilesController
