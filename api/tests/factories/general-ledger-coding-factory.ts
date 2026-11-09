import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker"

import { GeneralLedgerCoding } from "@/models"
import { travelAuthorizationFactory } from "@/factories"

export const generalLedgerCodingFactory = FactoryShark.define(
  GeneralLedgerCoding,
  ({ associate }) => {
    associate("travelAuthorization", travelAuthorizationFactory)

    const vote = faker.string.alphanumeric(3)
    const program = faker.string.alphanumeric(6)
    const object = faker.number.int({ min: 1000, max: 9999 })

    return {
      code: `${vote}-${program}-${object}`,
      amount: parseFloat(faker.finance.amount({ min: 100, max: 5000 })),
    }
  }
)

export default generalLedgerCodingFactory
