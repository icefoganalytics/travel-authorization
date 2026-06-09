import { Path } from "@/utils/deep-pick"
import { TravelAuthorization } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class GenericStatePolicy extends PolicyFactory(TravelAuthorization) {
  show(): boolean {
    throw new Error("Show is not dependent on state")
  }

  create(): boolean {
    throw new Error("Create is not dependent on state")
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
    return false
  }

  // TODO: move wizardStepName modification to a travel authorization "wizard" controller, and treat it like a state change.
  permittedAttributes(): Path[] {
    return ["wizardStepName"]
  }
}

export default GenericStatePolicy
