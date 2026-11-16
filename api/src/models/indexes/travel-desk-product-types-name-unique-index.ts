import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const TravelDeskProductTypesNameUniqueIndex = createIndexDecorator(
  "travel-desk-product-types-name-unique",
  {
    name: "travel_desk_product_types_name_unique",
    unique: true,
    where: { deletedAt: { [Op.is]: null } },
    msg: "Product name must be unique among active product types.",
  }
)

export default TravelDeskProductTypesNameUniqueIndex
