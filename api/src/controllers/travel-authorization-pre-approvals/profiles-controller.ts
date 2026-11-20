import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"
import { ProfilePolicy } from "@/policies/travel-authorization-pre-approvals"
import { CreateService, UpdateService } from "@/services/travel-authorization-pre-approval-profiles"
import { ShowSerializer } from "@/serializers/travel-authorization-pre-approval-profiles"
import BaseController from "@/controllers/base-controller"

export class ProfilesController extends BaseController<TravelAuthorizationPreApprovalProfile> {
  async create() {
    try {
      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval not found.",
        })
      }

      const policy = this.buildTravelAuthorizationPreApprovalPolicy(travelAuthorizationPreApproval)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel authorization pre-approval profiles.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelAuthorizationPreApprovalProfile = await CreateService.perform(
        travelAuthorizationPreApproval,
        permittedAttributes
      )
      const serializedTravelAuthorizationPreApprovalProfile = ShowSerializer.perform(
        travelAuthorizationPreApprovalProfile
      )
      return this.response.status(201).json({
        travelAuthorizationPreApprovalProfile: serializedTravelAuthorizationPreApprovalProfile,
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
      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval not found.",
        })
      }

      const policy = this.buildTravelAuthorizationPreApprovalPolicy(travelAuthorizationPreApproval)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel authorization pre-approval profile.",
        })
      }

      const travelAuthorizationPreApprovalProfile =
        await this.loadTravelAuthorizationPreApprovalProfile(travelAuthorizationPreApproval)
      if (isNil(travelAuthorizationPreApprovalProfile)) {
        return this.response.status(404).json({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      }

      const profilePolicy = this.buildTravelAuthorizationPreApprovalProfilePolicy(
        travelAuthorizationPreApprovalProfile
      )
      if (!profilePolicy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      }

      const permittedAttributes = profilePolicy.permitAttributesForUpdate(this.request.body)
      const updatedTravelAuthorizationPreApprovalProfile = await UpdateService.perform(
        travelAuthorizationPreApprovalProfile,
        permittedAttributes
      )
      const serializedTravelAuthorizationPreApprovalProfile = ShowSerializer.perform(
        updatedTravelAuthorizationPreApprovalProfile
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalProfile: serializedTravelAuthorizationPreApprovalProfile,
        policy: profilePolicy,
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
      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel authorization pre-approval not found.",
        })
      }

      const policy = this.buildTravelAuthorizationPreApprovalPolicy(travelAuthorizationPreApproval)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel authorization pre-approval profile.",
        })
      }

      const travelAuthorizationPreApprovalProfile =
        await this.loadTravelAuthorizationPreApprovalProfile(travelAuthorizationPreApproval)
      if (isNil(travelAuthorizationPreApprovalProfile)) {
        return this.response.status(404).json({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      }

      const profilePolicy = this.buildTravelAuthorizationPreApprovalProfilePolicy(
        travelAuthorizationPreApprovalProfile
      )
      if (!profilePolicy.destroy()) {
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

  private loadTravelAuthorizationPreApprovalProfile(
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval
  ): Promise<TravelAuthorizationPreApprovalProfile | null> {
    return TravelAuthorizationPreApprovalProfile.findOne({
      where: {
        id: this.params.travelAuthorizationPreApprovalProfileId,
        preApprovalId: travelAuthorizationPreApproval.id,
      },
      include: ["preApproval"],
    })
  }

  private loadTravelAuthorizationPreApproval(): Promise<TravelAuthorizationPreApproval | null> {
    return TravelAuthorizationPreApproval.findByPk(this.params.travelAuthorizationPreApprovalId)
  }

  private buildTravelAuthorizationPreApprovalPolicy(
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval
  ): ProfilePolicy {
    return new ProfilePolicy(this.currentUser, travelAuthorizationPreApproval)
  }

  private buildTravelAuthorizationPreApprovalProfilePolicy(
    travelAuthorizationPreApprovalProfile: TravelAuthorizationPreApprovalProfile
  ): TravelAuthorizationPreApprovalProfilesPolicy {
    return new TravelAuthorizationPreApprovalProfilesPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalProfile
    )
  }
}

export default ProfilesController
