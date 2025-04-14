import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { DistanceMatrix } from "@/models"

export const distanceMatrixFactory = Factory.define<DistanceMatrix>(({ onCreate }) => {
  onCreate((distanceMatrix) => {
    try {
      return distanceMatrix.save()
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create DistanceMatrix with attributes: ${JSON.stringify(distanceMatrix.dataValues, null, 2)}`
      )
    }
  })

  return DistanceMatrix.build({
    origin: faker.location.city(),
    destination: faker.location.city(),
    kilometers: faker.number.int({ min: 10, max: 10000 }),
  })
})

export default distanceMatrixFactory
