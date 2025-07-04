import { CreationAttributes } from "@sequelize/core"

import { GeneralLedgerCoding, User } from "@/models"
import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  private attributes: CreationAttributes<GeneralLedgerCoding>
  private currentUser: User

  constructor(attributes: Partial<GeneralLedgerCoding>, currentUser: User) {
    super()
    // TODO: fix the typing around attributes, I really just want Sequelize to handle the failure
    // but TypeScript seems intent on forcing me to handle it as well.
    this.attributes = attributes as CreationAttributes<GeneralLedgerCoding>
    this.currentUser = currentUser
  }

  async perform(): Promise<GeneralLedgerCoding> {
    const generalLedgerCoding = await GeneralLedgerCoding.create(this.attributes)
    // TODO: log that the current user performed this action

    return generalLedgerCoding
  }
}

export default CreateService
