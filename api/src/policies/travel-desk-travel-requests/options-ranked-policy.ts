import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { TravelAuthorization, TravelDeskTravelRequest } from "@/models"
import BasePolicy from "@/policies/base-policy"

export class OptionsRankedPolicy extends BasePolicy<TravelDeskTravelRequest> {
  create(): boolean {
    return this.travelAuthorization.userId === this.user.id
  }

  permittedAttributes(): Path[] {
    return []
  }

  private get travelAuthorization(): TravelAuthorization {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Travel Authorization is required")
    }

    return travelAuthorization
  }
}

export default OptionsRankedPolicy
