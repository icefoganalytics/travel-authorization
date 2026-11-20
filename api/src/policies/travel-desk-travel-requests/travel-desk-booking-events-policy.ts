import { TravelDeskTravelRequest } from "@/models"

import BasePolicy from "@/policies/base-policy"
import TravelDeskInvoicesPolicy from "@/policies/travel-desk-travel-requests/travel-desk-invoices-policy"

export class TravelDeskBookingEventsPolicy extends BasePolicy<TravelDeskTravelRequest> {
  show(): boolean {
    return this.invoicesPolicy.show()
  }

  private get invoicesPolicy(): TravelDeskInvoicesPolicy {
    return new TravelDeskInvoicesPolicy(this.user, this.record)
  }
}

export default TravelDeskBookingEventsPolicy
