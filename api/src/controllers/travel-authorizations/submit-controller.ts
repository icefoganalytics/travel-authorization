import { isNil } from "lodash"

import logger from "@/utils/logger"

import { BaseController } from "@/controllers/base-controller"
import { TravelAuthorization } from "@/models"
import { SubmitService } from "@/services/travel-authorizations"
import { SubmitPolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

// Submission is basically an enhanced TravelAuthorizationsController#update
// that also changes the status to "submitted".
export class SubmitController extends BaseController {
  async create() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({
          message: "Travel authorization not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to submit this travel authorization.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)

      const updatedTravelAuthorization = await SubmitService.perform(
        travelAuthorization,
        permittedAttributes,
        this.currentUser
      )

      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      logger.error(`Error submitting travel authorization: ${error}`, { error })
      return this.response.status(422).json({
        message: `Travel authorization submission failed: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(record: TravelAuthorization): SubmitPolicy {
    return new SubmitPolicy(this.currentUser, record)
  }
}

export default SubmitController
