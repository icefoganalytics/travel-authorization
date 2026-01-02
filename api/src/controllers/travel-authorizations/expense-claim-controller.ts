import { isNil } from "lodash"

import { BaseController } from "@/controllers/base-controller"
import { TravelAuthorization } from "@/models"
import { ExpenseClaimService } from "@/services/travel-authorizations"
import { ExpenseClaimPolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

export class ExpenseClaimController extends BaseController {
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
      return this.response.status(403).json({
        message: "You are not authorized to submit an expense claim for this travel authorization.",
      })
    }

    const { supervisorEmail } = this.request.body
    return ExpenseClaimService.perform(travelAuthorization, supervisorEmail, this.currentUser)
      .then((travelAuthorization) => {
        const serializedTravelAuthorization = ShowSerializer.perform(travelAuthorization)

        return this.response
          .status(200)
          .json({ travelAuthorization: serializedTravelAuthorization })
      })
      .catch((error) => {
        return this.response
          .status(422)
          .json({ message: `Travel authorization expense claim submission failed: ${error}` })
      })
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId, {
      include: ["travelSegments"],
    })
  }

  private buildPolicy(record: TravelAuthorization): ExpenseClaimPolicy {
    return new ExpenseClaimPolicy(this.currentUser, record)
  }
}

export default ExpenseClaimController
