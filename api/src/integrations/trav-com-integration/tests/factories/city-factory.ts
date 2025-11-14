import { Includeable } from "@sequelize/core"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravComIntegration } from "@/integrations"
import { nestedSaveAndAssociateIfNew } from "@/integrations/trav-com-integration/tests/factories/helpers"

import BaseFactory from "@/integrations/trav-com-integration/tests/factories/base-factory"

type TransientParam = {
  include?: Includeable | Includeable[]
}

class CityFactory extends BaseFactory<TravComIntegration.Models.City, TransientParam> {}

export const cityFactory = CityFactory.define(({ transientParams, onCreate }) => {
  onCreate(async (city) => {
    try {
      await nestedSaveAndAssociateIfNew(city)

      if (transientParams.include === undefined) {
        return city
      }

      return city.reload({
        include: transientParams.include,
      })
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create City with attributes: ${JSON.stringify(city.dataValues, null, 2)}`
      )
    }
  })

  return TravComIntegration.Models.City.build({
    cityType: faker.number.int({ min: 0, max: 2 }),
    cityName: faker.location.city().toUpperCase(),
    latitudeDegrees: faker.number.int({ min: 0, max: 90 }),
    latitudeMinutes: faker.number.int({ min: 0, max: 59 }),
    latitudeSeconds: faker.number.int({ min: 0, max: 59 }),
    longitudeDegrees: faker.number.int({ min: 0, max: 180 }),
    longitudeMinutes: faker.number.int({ min: 0, max: 59 }),
    longitudeSeconds: faker.number.int({ min: 0, max: 59 }),
  })
})

export default cityFactory
