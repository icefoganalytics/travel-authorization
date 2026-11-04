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
    const permittedAttributes: Path[] = []

    if (this.user.isAdmin || this.travelAuthorization.supervisorEmail === this.user.email) {
      permittedAttributes.push("requestType", "question", "response")
    } else if (this.travelAuthorization.userId === this.user.id) {
      permittedAttributes.push("response")
    }

    return permittedAttributes
  }
}

export default OptionsProvidedStatePolicy
