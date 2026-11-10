import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { PerDiem } from "@/models"

export const perDiemFactory = FactoryShark.define(PerDiem, () => {
  return {
    claimType: faker.helpers.enumValue(PerDiem.ClaimTypes),
    travelRegion: faker.helpers.enumValue(PerDiem.TravelRegions),
    amount: parseFloat(faker.finance.amount({ min: 50, max: 200 })),
    currency: faker.helpers.enumValue(PerDiem.CurrencyTypes),
  }
})

export default perDiemFactory
