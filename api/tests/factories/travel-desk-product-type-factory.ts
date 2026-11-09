import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelDeskProductType } from "@/models"

export const travelDeskProductTypeFactory = Factory.define<TravelDeskProductType>(
  ({ onCreate }) => {
    onCreate((productType) => productType.save())

    return TravelDeskProductType.build({
      code: faker.helpers.slugify(faker.word.words(2)).toLowerCase(),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
    })
  }
)

export default travelDeskProductTypeFactory
