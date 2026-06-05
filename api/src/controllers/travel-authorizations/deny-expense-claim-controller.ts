import { isNil } from "lodash"

import { BaseController } from "@/controllers/base-controller"
import { TravelAuthorization } from "@/models"
import { DenyExpenseClaimPolicy } from "@/policies/travel-authorizations"
import { TravelAuthorizations } from "@/services"
import { ShowSerializer } from "@/serializers/travel-authorizations"

export class DenyExpenseClaimController extends BaseController {
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
          message: "You are not authorized to deny this travel authorization.",
        })
      }

      const { denialReason } = this.request.body
      const updatedTravelAuthorization = await TravelAuthorizations.DenyExpenseClaimService.perform(
        travelAuthorization,
        denialReason,
        this.currentUser
      )
      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Travel authorization expense claim denial failed: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(record: TravelAuthorization): DenyExpenseClaimPolicy {
    return new DenyExpenseClaimPolicy(this.currentUser, record)
  }
}

export default DenyExpenseClaimController
