import { InferCreationAttributes } from "@sequelize/core"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravComIntegration } from "@/integrations"

// City has no primary key; its associations target the nullable cityCode instead of id.
export async function createCity(
  overrides: Partial<InferCreationAttributes<TravComIntegration.Models.City>> = {}
): Promise<TravComIntegration.Models.City> {
  const city = TravComIntegration.Models.City.build({
    cityType: faker.number.int({ min: 0, max: 2 }),
    cityName: faker.location.city().toUpperCase(),
    latitudeDegrees: faker.number.int({ min: 0, max: 90 }),
    latitudeMinutes: faker.number.int({ min: 0, max: 59 }),
    latitudeSeconds: faker.number.int({ min: 0, max: 59 }),
    longitudeDegrees: faker.number.int({ min: 0, max: 180 }),
    longitudeMinutes: faker.number.int({ min: 0, max: 59 }),
    longitudeSeconds: faker.number.int({ min: 0, max: 59 }),
    ...overrides,
  })

  await city.save()
  return city
}

export default createCity
