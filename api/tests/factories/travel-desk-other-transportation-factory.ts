import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelDeskOtherTransportation } from "@/models"
import travelDeskTravelRequestFactory from "@/factories/travel-desk-travel-request-factory"

export const travelDeskOtherTransportationFactory = FactoryShark.define(
  TravelDeskOtherTransportation,
  ({ associate }) => {
    associate("travelRequest", travelDeskTravelRequestFactory)

    return {
      depart: faker.location.city(),
      arrive: faker.location.city(),
      transportationType: faker.helpers.enumValue(
        TravelDeskOtherTransportation.TransportationTypes
      ),
      date: faker.date.future(),
      additionalNotes: null,
      status: TravelDeskOtherTransportation.Statuses.REQUESTED,
      reservedTransportationInfo: null,
      booking: null,
    }
  }
)

export default travelDeskOtherTransportationFactory
