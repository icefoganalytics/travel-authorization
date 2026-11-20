import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalProfile } from "@/models"
import { TravelAuthorizationPreApprovalsPolicy } from "@/policies"
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
      if (!policy.createProfile()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel authorization pre-approval profiles.",
        })
      }

      const permittedAttributes = policy.permitProfileAttributesForCreate(this.request.body)
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

  private buildPolicy(travelAuthorizationPreApproval: TravelAuthorizationPreApproval) {
    return new TravelAuthorizationPreApprovalsPolicy(
      this.currentUser,
      travelAuthorizationPreApproval
    )
  }
}

export default ProfilesController
