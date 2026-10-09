import { GeneralLedgerCoding, User } from "@/models"
import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  private generalLedgerCoding: GeneralLedgerCoding
  private currentUser: User

  constructor(generalLedgerCoding: GeneralLedgerCoding, currentUser: User) {
    super()
    this.generalLedgerCoding = generalLedgerCoding
    this.currentUser = currentUser
  }

  async perform(): Promise<GeneralLedgerCoding> {
    await this.generalLedgerCoding.destroy()

    // TODO: log that the current user performed this action

    return this.generalLedgerCoding
  }
}

export default DestroyService
