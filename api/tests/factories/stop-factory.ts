import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { Stop } from "@/models"
import { locationFactory, travelAuthorizationFactory } from "@/factories"
import { anytime } from "@/factories/helpers"

export const stopFactory = FactoryShark.define(Stop, ({ associate }) => {
  associate("travelAuthorization", travelAuthorizationFactory)
  associate("location", locationFactory)

  return {
    departureDate: faker.date.soon(),
    departureTime: anytime(),
    transport: faker.helpers.arrayElement(Object.values(Stop.TravelMethods)),
    accommodationType: faker.helpers.arrayElement(Object.values(Stop.AccommodationTypes)),
    isActual: false,
  }
})

export default stopFactory
