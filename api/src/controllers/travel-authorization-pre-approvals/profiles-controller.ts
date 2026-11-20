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

      const policy = this.buildPolicy(travelAuthorizationPreApproval)
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
      const travelAuthorizationPreApprovalProfile =
        await this.loadTravelAuthorizationPreApprovalProfile()
      if (isNil(travelAuthorizationPreApprovalProfile)) {
        return this.response.status(404).json({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      }

      const policy = new TravelAuthorizationPreApprovalProfilesPolicy(
        this.currentUser,
        travelAuthorizationPreApprovalProfile
      )
      if (!policy.update()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelAuthorizationPreApprovalProfile = await UpdateService.perform(
        travelAuthorizationPreApprovalProfile,
        permittedAttributes
      )
      const serializedTravelAuthorizationPreApprovalProfile = ShowSerializer.perform(
        updatedTravelAuthorizationPreApprovalProfile
      )
      return this.response.status(200).json({
        travelAuthorizationPreApprovalProfile: serializedTravelAuthorizationPreApprovalProfile,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating travel authorization pre-approval profile: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel authorization pre-approval profile: ${error}`,
      })
    }
  }

  private loadTravelAuthorizationPreApprovalProfile() {
    return TravelAuthorizationPreApprovalProfile.findOne({
      where: {
        id: this.params.travelAuthorizationPreApprovalProfileId,
        preApprovalId: this.params.travelAuthorizationPreApprovalId,
      },
      include: ["preApproval"],
    })
  }

  private loadTravelAuthorizationPreApproval(): Promise<TravelAuthorizationPreApproval | null> {
    return TravelAuthorizationPreApproval.findByPk(this.params.travelAuthorizationPreApprovalId)
  }

  private buildPolicy(travelAuthorizationPreApproval: TravelAuthorizationPreApproval): ProfilePolicy {
    return new ProfilePolicy(this.currentUser, travelAuthorizationPreApproval)
  }
}

export default ProfilesController
