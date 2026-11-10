import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { Location } from "@/models"

export const locationFactory = FactoryShark.define(Location, () => {
  return {
    province: faker.location.state(),
    city: faker.location.city(),
  }
})

export default locationFactory
