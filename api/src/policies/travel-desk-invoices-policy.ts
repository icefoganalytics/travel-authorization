import { type FindOptions, type Attributes } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"

import { TravelDeskInvoice, User } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"

export class TravelDeskInvoicesPolicy extends PolicyFactory(TravelDeskInvoice) {
  show(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }

  create(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }

  update(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }

  destroy(): boolean {
    return this.user.isAdmin || this.user.isTravelDeskUser
  }

  permittedAttributes(): Path[] {
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
      {
        items: [
          "travelDeskProductTypeId",
          "travelDeskFlightSegmentId",
          "sourceAirSegmentNumber",
          "sourceServiceFeeEventId",
          "passengerName",
          "ticketNumber",
          "vendor",
          "description",
          "saleType",
          "grossAmount",
          "position",
        ],
      },
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return [
      "recordLocator",
      "sourceBookingEventId",
      "sourceServiceFeeEventIds",
      ...this.permittedAttributes(),
    ]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskInvoice>> {
    if (user.isAdmin || user.isTravelDeskUser) return ALL_RECORDS_SCOPE

    return NO_RECORDS_SCOPE
  }
}

export default TravelDeskInvoicesPolicy
