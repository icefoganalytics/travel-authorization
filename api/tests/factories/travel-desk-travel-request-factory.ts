import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelDeskTravelRequest } from "@/models"
import travelAuthorizationFactory from "@/factories/travel-authorization-factory"

export const travelDeskTravelRequestFactory = FactoryShark.define(
  TravelDeskTravelRequest,
  ({ associate }) => {
    associate("travelAuthorization", travelAuthorizationFactory)

    return {
      legalFirstName: faker.person.firstName(),
      legalLastName: faker.person.lastName(),
      strAddress: faker.location.streetAddress(),
      city: faker.location.city(),
      province: faker.location.state(),
      postalCode: faker.location.zipCode(),
      travelPurpose: faker.lorem.sentence(),
      busPhone: faker.phone.number(),
      busEmail: faker.internet.email(),
      status: faker.helpers.enumValue(TravelDeskTravelRequest.Statuses),
    }
  }
)

export default travelDeskTravelRequestFactory
