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

  permittedAttributes(): Path[] {
    return []
  }
}

export default GenericStatePolicy
