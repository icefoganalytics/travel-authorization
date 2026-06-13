import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorization } from "@/models"
import { SubmitExpenseClaimService } from "@/services/travel-authorizations"
import { SubmitExpenseClaimPolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

import BaseController from "@/controllers/base-controller"

export class SubmitExpenseClaimController extends BaseController {
  async create() {
    try {
      if (isNil(this.params.travelAuthorizationId)) {
        return this.response.status(404).json({
          message: "Missing travel authorization id param.",
        })
      }

      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({
          message: "Travel authorization not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.create()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to submit an expense claim for this travel authorization.",
        })
      }

      const { supervisorEmail } = this.request.body
      const updatedTravelAuthorization = await SubmitExpenseClaimService.perform(
        travelAuthorization,
        supervisorEmail,
        this.currentUser
      )
      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)

      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      logger.error(`Failed to submit expense claim: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel authorization expense claim submission failed: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId, {
      include: ["travelSegments"],
    })
  }

  private buildPolicy(record: TravelAuthorization): SubmitExpenseClaimPolicy {
    return new SubmitExpenseClaimPolicy(this.currentUser, record)
  }
}

export default SubmitExpenseClaimController
