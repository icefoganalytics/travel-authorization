import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { TravelAuthorization } from "@/models"
import { travelPurposeFactory, userFactory } from "@/factories"

export const travelAuthorizationFactory = FactoryShark.define<TravelAuthorization>(
  TravelAuthorization,
  ({ associate }) => {
    associate("user", userFactory)
    associate("purpose", travelPurposeFactory)

    return {
      slug: faker.string.uuid(),
    }
  }
)

export default travelAuthorizationFactory
