import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelDeskTravelAgency } from "@/models"

export const travelDeskTravelAgencyFactory = FactoryShark.define(TravelDeskTravelAgency, () => {
  return {
    agencyName: faker.company.name(),
    contactName: faker.person.fullName(),
    contactEmail: faker.internet.email(),
    contactPhoneNumber: faker.string.numeric(10),
    agencyInfo: null,
  }
})

export default travelDeskTravelAgencyFactory
