import { TravelDeskTravelRequest } from "@/models"

import BasePolicy from "@/policies/base-policy"

export class TravelDeskInvoicesPolicy extends BasePolicy<TravelDeskTravelRequest> {
  show(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }
}

export default TravelDeskInvoicesPolicy
