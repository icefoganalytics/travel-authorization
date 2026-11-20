import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskInvoice } from "@/models"
import { travelDeskTravelRequestFactory } from "@/factories/travel-desk-travel-request-factory"

export const travelDeskInvoiceFactory = FactoryShark.define(
  TravelDeskInvoice,
  ({ associate }) => {
    associate("travelDeskTravelRequest", travelDeskTravelRequestFactory)

    const bookingReference = faker.string.alphanumeric(6).toUpperCase()
    const externalBookingEventIdentifier = faker.number.int({ min: 1, max: 1_000_000 })

    return {
      bookingReference,
      externalBookingEventIdentifier,
      currencyCode: "CAD",
      grossAmount: "0.000",
    }
  }
)

export default travelDeskInvoiceFactory
