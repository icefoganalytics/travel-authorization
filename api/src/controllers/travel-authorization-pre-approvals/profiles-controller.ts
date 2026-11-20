import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import { ProfilePolicy } from "@/policies/travel-authorization-pre-approvals"
import { CreateService } from "@/services/travel-authorization-pre-approval-profiles"
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

  private loadTravelAuthorizationPreApproval(): Promise<TravelAuthorizationPreApproval | null> {
    return TravelAuthorizationPreApproval.findByPk(this.params.travelAuthorizationPreApprovalId)
  }

  private buildPolicy(travelAuthorizationPreApproval: TravelAuthorizationPreApproval): ProfilePolicy {
    return new ProfilePolicy(this.currentUser, travelAuthorizationPreApproval)
  }
}

export default ProfilesController
