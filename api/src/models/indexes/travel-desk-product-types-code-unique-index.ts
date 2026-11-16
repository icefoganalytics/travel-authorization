import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const TravelDeskProductTypesCodeUniqueIndex = createIndexDecorator(
  "travel-desk-product-types-code-unique",
  {
    name: "travel_desk_product_types_code_unique",
    unique: true,
    where: { deletedAt: { [Op.is]: null } },
    msg: "Product code must be unique among active product types.",
  }
)

export default TravelDeskProductTypesCodeUniqueIndex
