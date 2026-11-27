import { TravelDeskTravelRequest } from "@/models"
import BasePolicy from "@/policies/base-policy"

export class TravelPortBookingsPolicy extends BasePolicy<TravelDeskTravelRequest> {
  show(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }

  update(): boolean {
    return this.show()
  }
}

export default TravelPortBookingsPolicy
