import { type FindOptions, type Attributes } from "@sequelize/core"

import { TravelDeskInvoice, User } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"

export class TravelDeskInvoicesPolicy extends PolicyFactory(TravelDeskInvoice) {
  show(): boolean {
    return TravelDeskInvoicesPolicy.isStaff(this.user)
  }

  create(): boolean {
    return TravelDeskInvoicesPolicy.isStaff(this.user)
  }

  update(): boolean {
    return TravelDeskInvoicesPolicy.isStaff(this.user)
  }

  destroy(): boolean {
    return TravelDeskInvoicesPolicy.isStaff(this.user)
  }

  permittedAttributes(): string[] {
    return [
      "invoiceNumber",
      "invoiceDate",
      "warrantNumber",
      "clientNumber",
      "clientName",
      "department",
      "mailcode",
      "iataNumber",
      "bookingAgentName",
      "ticketingAgentName",
      "bookingDate",
      "currencyCode",
      "items",
    ]
  }

  static isStaff(user: User): boolean {
    return user.roles.includes(User.Roles.ADMIN) || user.roles.includes(User.Roles.TRAVEL_DESK_USER)
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskInvoice>> {
    if (TravelDeskInvoicesPolicy.isStaff(user)) return ALL_RECORDS_SCOPE

    return NO_RECORDS_SCOPE
  }
}

export default TravelDeskInvoicesPolicy
