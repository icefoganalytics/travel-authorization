import { Includeable } from "sequelize"
import { faker } from "@faker-js/faker"

import { TravelAuthorization } from "@/models"
import BaseFactory from "@/factories/base-factory"
import { travelPurposeFactory, userFactory } from "@/factories"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"

type TransientParam = {
  include?: Includeable | Includeable[]
}

class TravelAuthorizationFactory extends BaseFactory<TravelAuthorization, TransientParam> {}

export const travelAuthorizationFactory = TravelAuthorizationFactory.define(
  ({ associations, transientParams, onCreate }) => {
    onCreate(async (travelAuthorization) => {
      try {
        await nestedSaveAndAssociateIfNew(travelAuthorization)

        if (transientParams.include === undefined) {
          return travelAuthorization
        }

        return travelAuthorization.reload({
          include: transientParams.include,
        })
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelAuthorization with attributes: ${JSON.stringify(
            travelAuthorization.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const travelAuthorization = TravelAuthorization.build({
      slug: faker.string.uuid(),
    })

    travelAuthorization.purpose = associations.purpose ?? travelPurposeFactory.build()
    travelAuthorization.user = associations.user ?? userFactory.build()

    return travelAuthorization
  }
)

export default travelAuthorizationFactory
