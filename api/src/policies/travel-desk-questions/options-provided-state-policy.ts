import { Path } from "@/utils/deep-pick"
import { GenericStatePolicy } from "@/policies/travel-desk-questions"

export class OptionsProvidedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (super.update()) return true

    return this.travelAuthorization.userId === this.user.id
  }

  permittedAttributes(): Path[] {
    if (!super.update() && this.travelAuthorization.userId === this.user.id) {
      return ["response"]
    }

    return super.permittedAttributes()
  }
}

export default OptionsProvidedStatePolicy
