import { isNil } from "lodash"

import { BaseController } from "@/controllers/base-controller"
import { TravelAuthorization } from "@/models"
import { TravelAuthorizations } from "@/services"
import { DenyPolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

export class DenyController extends BaseController {
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
        .json({ message: "You are not authorized to deny this travel authorization." })
    }

    const { denialReason } = this.request.body
    return TravelAuthorizations.DenyService.perform(
      travelAuthorization,
      denialReason,
      this.currentUser
    )
      .then((travelAuthorization) => {
        const serializedTravelAuthorization = ShowSerializer.perform(travelAuthorization)

        return this.response
          .status(200)
          .json({ travelAuthorization: serializedTravelAuthorization })
      })
      .catch((error) => {
        return this.response
          .status(422)
          .json({ message: `Travel authorization denial failed: ${error}` })
      })
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(record: TravelAuthorization): DenyPolicy {
    return new DenyPolicy(this.currentUser, record)
  }
}

export default DenyController
