import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelPurpose } from "@/models"

export const travelPurposeFactory = FactoryShark.define(TravelPurpose, ({ sequence }) => {
  return {
    purpose: `${faker.lorem.words(3)}-${sequence}`,
  }
})

export default travelPurposeFactory
