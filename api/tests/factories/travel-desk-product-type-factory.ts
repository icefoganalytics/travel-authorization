import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskProductType } from "@/models"

export const travelDeskProductTypeFactory = FactoryShark.define(
  TravelDeskProductType,
  () => {
    return {
      code: faker.helpers.slugify(faker.word.words(2)).toLowerCase(),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
    }
  }
)

export default travelDeskProductTypeFactory
