import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorization } from "@/models"
import { ExpenseService } from "@/services/travel-authorizations"
import { ExpensePolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations"

import BaseController from "@/controllers/base-controller"

export class ExpenseController extends BaseController {
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
          message: "You are not authorized to expense this travel authorization.",
        })
      }

      const updatedTravelAuthorization = await ExpenseService.perform(
        travelAuthorization,
        this.currentUser
      )

      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
        policy,
      })
    } catch (error) {
      logger.error(`Expensing travel authorization failed: ${error}`, { error })
      return this.response.status(422).json({
        message: `Expensing travel authorization failed: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(travelAuthorization: TravelAuthorization): ExpensePolicy {
    return new ExpensePolicy(this.currentUser, travelAuthorization)
  }
}

export default ExpenseController
