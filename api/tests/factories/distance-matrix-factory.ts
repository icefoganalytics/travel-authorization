import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { DistanceMatrix } from "@/models"

export const distanceMatrixFactory = FactoryShark.define(DistanceMatrix, () => {
  return {
    origin: faker.location.city(),
    destination: faker.location.city(),
    kilometers: faker.number.int({ min: 10, max: 10000 }),
  }
})

export default distanceMatrixFactory
