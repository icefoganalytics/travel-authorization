import { type FindOptions, type Attributes } from "@sequelize/core"

import { deepPick, type Path } from "@/utils/deep-pick"

import { TravelDeskInvoice, User } from "@/models"
import PolicyFactory from "@/policies/policy-factory"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"

import {
  type TravelDeskInvoiceCreationAttributes,
  type TravelDeskInvoiceUpdateAttributes,
} from "@/services/travel-desk-invoices"

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

  permitAttributesForCreate(record: unknown): TravelDeskInvoiceCreationAttributes {
    return deepPick(record, this.permittedAttributesForCreate())
  }

  permitAttributesForUpdate(record: unknown): TravelDeskInvoiceUpdateAttributes {
    return deepPick(record, this.permittedAttributes())
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
        itemsAttributes: [
          "productType",
          "travelDeskFlightSegmentId",
          "sourceAirSegmentNumber",
          "sourceServiceFeeEventExternalIdentifier",
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
      "externalBookingEventIdentifier",
      "sourceServiceFeeEventExternalIdentifiers",
      ...this.permittedAttributes(),
    ]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskInvoice>> {
    if (user.isAdmin || user.isTravelDeskUser) return ALL_RECORDS_SCOPE

    return NO_RECORDS_SCOPE
  }
}

export default TravelDeskInvoicesPolicy
