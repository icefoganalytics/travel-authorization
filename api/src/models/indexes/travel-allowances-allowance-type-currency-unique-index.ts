import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const TravelAllowancesAllowanceTypeCurrencyUniqueIndex = createIndexDecorator(
  "travel-allowances-allowance-type-currency-unique",
  {
    unique: true,
    name: "travel_allowances_allowance_type_currency_unique",
    where: {
      deletedAt: {
        [Op.is]: null,
      },
    },
  }
)

export default TravelAllowancesAllowanceTypeCurrencyUniqueIndex
