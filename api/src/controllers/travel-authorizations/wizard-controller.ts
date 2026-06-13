import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelAuthorization } from "@/models"
import { UpdateService } from "@/services/travel-authorizations/wizard"
import { WizardPolicy } from "@/policies/travel-authorizations"
import { ShowSerializer } from "@/serializers/travel-authorizations/wizard"

import BaseController from "@/controllers/base-controller"

export class WizardController extends BaseController {
  async show() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({
          message: "Travel authorization not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel authorization wizard.",
        })
      }

      const serializedTravelAuthorization = ShowSerializer.perform(travelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      logger.error(`Error fetching travel authorization wizard: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel authorization wizard: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelAuthorization = await this.loadTravelAuthorization()
      if (isNil(travelAuthorization)) {
        return this.response.status(404).json({
          message: "Travel authorization not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorization)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel authorization wizard.",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      const updatedTravelAuthorization = await UpdateService.perform(
        travelAuthorization,
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelAuthorization = ShowSerializer.perform(updatedTravelAuthorization)
      return this.response.status(200).json({
        travelAuthorization: serializedTravelAuthorization,
      })
    } catch (error) {
      logger.error(`Failed to update travel authorization wizard: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update travel authorization wizard: ${error}`,
      })
    }
  }

  private loadTravelAuthorization(): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(this.params.travelAuthorizationId)
  }

  private buildPolicy(record: TravelAuthorization): WizardPolicy {
    return new WizardPolicy(this.currentUser, record)
  }
}

export default WizardController
