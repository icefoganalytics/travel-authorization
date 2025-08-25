import { CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"

import { GeneralLedgerCoding, User } from "@/models"
import BaseService from "@/services/base-service"

export type GeneralLedgerCodingCreationAttributes = Partial<CreationAttributes<GeneralLedgerCoding>>

export class CreateService extends BaseService {
  constructor(
    protected attributes: GeneralLedgerCodingCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<GeneralLedgerCoding> {
    const { travelAuthorizationId, code, amount, ...optionalAttributes } = this.attributes
    if (isNil(travelAuthorizationId)) {
      throw new Error("Travel authorization ID is required.")
    }

    if (isNil(code)) {
      throw new Error("Code is required.")
    }

    if (isNil(amount)) {
      throw new Error("Amount is required.")
    }

    const generalLedgerCoding = await GeneralLedgerCoding.create({
      ...optionalAttributes,
      travelAuthorizationId,
      code,
      amount,
    })
    // TODO: log that the current user performed this action

    return generalLedgerCoding
  }
}

export default CreateService
