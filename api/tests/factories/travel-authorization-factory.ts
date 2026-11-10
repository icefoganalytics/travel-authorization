import FactoryShark from "factory-shark"
import { Includeable } from "@sequelize/core"
import { faker } from "@faker-js/faker"

import { TravelAuthorization } from "@/models"
import { travelPurposeFactory, userFactory } from "@/factories"

type TransientParam = {
  include?: Includeable | Includeable[]
}

export const travelAuthorizationFactory = FactoryShark.define<TravelAuthorization, TransientParam>(
  TravelAuthorization,
  ({ associate, transient, afterCreate }) => {
    associate("user", userFactory)
    associate("purpose", travelPurposeFactory)

    afterCreate(async (travelAuthorization) => {
      if (transient.include !== undefined) {
        await travelAuthorization.reload({
          include: transient.include,
        })
      }
    })

    return {
      slug: faker.string.uuid(),
    }
  }
)

export default travelAuthorizationFactory
