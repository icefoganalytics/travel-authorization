import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const PerDiemsClaimTypeTravelRegionCurrencyUniqueIndex = createIndexDecorator(
  "per-diems-claim-type-travel-region-currency-unique",
  {
    unique: true,
    name: "per_diems_claim_type_travel_region_currency_unique",
    where: {
      deletedAt: {
        [Op.is]: null,
      },
    },
  }
)

export default PerDiemsClaimTypeTravelRegionCurrencyUniqueIndex
