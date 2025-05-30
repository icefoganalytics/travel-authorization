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

  // Remove once wizardStepName update has been moved to a wizard controller.
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

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
