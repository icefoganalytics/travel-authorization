import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelAuthorizationPreApprovalProfile } from "@/models"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"
import {
  IndexSerializer,
  ShowSerializer,
} from "@/serializers/travel-authorization-pre-approval-profiles"
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
      const serializedTravelAuthorizationPreApprovalProfiles = IndexSerializer.perform(
        travelAuthorizationPreApprovalProfiles
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalProfiles: serializedTravelAuthorizationPreApprovalProfiles,
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

    const serializedTravelAuthorizationPreApprovalProfile = ShowSerializer.perform(
      travelAuthorizationPreApprovalProfile
    )
    return this.response.status(200).json({
      travelAuthorizationPreApprovalProfile: serializedTravelAuthorizationPreApprovalProfile,
      policy,
    })
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
      this.params.travelAuthorizationPreApprovalProfileId,
      {
        include: ["preApproval"],
      }
    )
  }

  private buildPolicy(travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile) {
    return new TravelAuthorizationPreApprovalProfilesPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalProfile
    )
  }
}

export default TravelAuthorizationPreApprovalProfilesController
