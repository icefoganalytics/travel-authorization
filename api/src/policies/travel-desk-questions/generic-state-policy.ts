import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { TravelAuthorization, TravelDeskQuestion, TravelDeskTravelRequest } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { TravelDeskTravelRequestsPolicy } from "@/policies"

export class GenericStatePolicy extends PolicyFactory(TravelDeskQuestion) {
  update(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return ["requestType", "question", "response"]
  }

  protected get travelDeskTravelRequest(): TravelDeskTravelRequest {
    const { travelRequest } = this.record
    if (isUndefined(travelRequest)) {
      throw new Error("Travel request is required")
    }

    return travelRequest
  }

  protected get travelAuthorization(): TravelAuthorization {
    const { travelAuthorization } = this.travelDeskTravelRequest
    if (isUndefined(travelAuthorization)) {
      throw new Error("Travel authorization is required")
    }

    return travelAuthorization
  }

  protected get travelDeskTravelRequestsPolicy(): TravelDeskTravelRequestsPolicy {
    return new TravelDeskTravelRequestsPolicy(this.user, this.travelDeskTravelRequest)
  }
}

export default GenericStatePolicy
