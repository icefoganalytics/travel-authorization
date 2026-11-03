import { Path } from "@/utils/deep-pick"
import { GenericStatePolicy } from "@/policies/travel-desk-questions"

export class OptionsProvidedStatePolicy extends GenericStatePolicy {
  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.travelAuthorization.supervisorEmail === this.user.email) return true
    if (this.travelAuthorization.userId === this.user.id) return true

    return false
  }

  permittedAttributes(): Path[] {
    if (this.user.isAdmin) return ["requestType", "question", "response"]

    if (this.travelAuthorization.supervisorEmail === this.user.email) {
      return ["requestType", "question", "response"]
    }

    if (this.travelAuthorization.userId === this.user.id) return ["response"]

    return []
  }
}

export default OptionsProvidedStatePolicy
