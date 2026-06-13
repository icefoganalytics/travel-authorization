import { faker } from "@faker-js/faker"

import { GeneralLedgerCoding } from "@/models"
import BaseFactory from "@/factories/base-factory"
import { travelAuthorizationFactory } from "@/factories"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"

export const generalLedgerCodingFactory = BaseFactory.define<GeneralLedgerCoding>(
  ({ associations, onCreate }) => {
    onCreate(async (generalLedgerCoding) => {
      try {
        await nestedSaveAndAssociateIfNew(generalLedgerCoding)
        return generalLedgerCoding
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create GeneralLedgerCoding with attributes: ${JSON.stringify(
            generalLedgerCoding.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const travelAuthorization =
      associations.travelAuthorization ??
      travelAuthorizationFactory.build({
        id: undefined,
      })

    const vote = faker.string.alphanumeric(3)
    const program = faker.string.alphanumeric(6)
    const object = faker.number.int({ min: 1000, max: 9999 })

    const generalLedgerCoding = GeneralLedgerCoding.build({
      travelAuthorizationId: travelAuthorization.id,
      code: `${vote}-${program}-${object}`,
      amount: parseFloat(faker.finance.amount({ min: 100, max: 5000 })),
    })

    generalLedgerCoding.travelAuthorization = travelAuthorization

    return generalLedgerCoding
  }
)

export default generalLedgerCodingFactory
