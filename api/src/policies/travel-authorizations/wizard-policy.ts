import { Path } from "@/utils/deep-pick"

import { TravelAuthorization } from "@/models"
import PolicyFactory from "@/policies/policy-factory"

export class WizardPolicy extends PolicyFactory(TravelAuthorization) {
  show(): boolean {
    if (this.record.userId === this.user.id) return true

    return false
  }

  update(): boolean {
    if (this.record.userId === this.user.id) return true

    return false
  }

  permittedAttributes(): Path[] {
    return ["wizardStepName"]
  }
}

export default WizardPolicy
