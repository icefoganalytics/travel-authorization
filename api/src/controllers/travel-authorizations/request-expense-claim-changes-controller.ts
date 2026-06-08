import { isNil } from "lodash"

import { BaseController } from "@/controllers/base-controller"
import { TravelAuthorization } from "@/models"
import { RequestExpenseClaimChangesPolicy } from "@/policies/travel-authorizations"
import { TravelAuthorizations } from "@/services"
import { ShowSerializer } from "@/serializers/travel-authorizations"

export class RequestExpenseClaimChangesController extends BaseController {
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
          message: "You are not authorized to request changes to this expense claim.",
        })
      }

      const { requestChange } = this.request.body
      const updatedTravelAuthorization =
        await TravelAuthorizations.RequestExpenseClaimChangesService.perform(
          travelAuthorization,
          requestChange,
          this.currentUser
        )
      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to request expense claim changes: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(record: TravelAuthorization): RequestExpenseClaimChangesPolicy {
    return new RequestExpenseClaimChangesPolicy(this.currentUser, record)
  }
}

export default RequestExpenseClaimChangesController
