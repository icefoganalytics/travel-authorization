import { isNil } from "lodash"

import { TravelAuthorization } from "@/models"
import { ApproveExpenseClaimService } from "@/services/travel-authorizations"
import { ApprovePolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

import BaseController from "@/controllers/base-controller"

export class ApproveExpenseClaimController extends BaseController {
  async create() {
    if (isNil(this.params.travelAuthorizationId)) {
      return this.response.status(404).json({ message: "Missing travel authorization id param." })
    }

    const travelAuthorization = await this.loadTravelAuthorization()
    if (isNil(travelAuthorization)) {
      return this.response.status(404).json({ message: "Travel authorization not found." })
    }

    const policy = this.buildPolicy(travelAuthorization)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to approve this travel authorization." })
    }

    return ApproveExpenseClaimService.perform(travelAuthorization, this.currentUser)
      .then((travelAuthorization) => {
        const serializedTravelAuthorization = ShowSerializer.perform(travelAuthorization)

        return this.response
          .status(200)
          .json({ travelAuthorization: serializedTravelAuthorization })
      })
      .catch((error) => {
        return this.response
          .status(422)
          .json({ message: `Travel authorization approval failed: ${error}` })
      })
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(record: TravelAuthorization): ApprovePolicy {
    return new ApprovePolicy(this.currentUser, record)
  }
}

export default ApproveExpenseClaimController
