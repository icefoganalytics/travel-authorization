import { isNil } from "lodash"

import { BaseController } from "@/controllers/base-controller"
import { TravelAuthorization } from "@/models"
import { RevertToDraftService } from "@/services/travel-authorizations"
import { RevertToDraftPolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

// Submission is basically an enhanced TravelAuthorizationsController#update
// that also changes the status to "submitted".
export class RevertToDraftController extends BaseController {
  async create() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({ message: "Travel authorization not found." })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to revert this travel authorization to draft." })
      }

      const updatedTravelAuthorization = await RevertToDraftService.perform(
        travelAuthorization,
        this.currentUser
      )
      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to revert travel authorization to draft: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId, {
      include: ["user"],
    })
  }

  private buildPolicy(record: TravelAuthorization): RevertToDraftPolicy {
    return new RevertToDraftPolicy(this.currentUser, record)
  }
}

export default RevertToDraftController
