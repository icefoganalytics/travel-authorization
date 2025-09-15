import { isNil } from "lodash"

import { yukonGovernmentIntegration } from "@/integrations"
import { GeneralLedgerCoding, User } from "@/models"
import BaseService from "@/services/base-service"

export type GeneralLedgerCodingUpdateAttributes = Partial<GeneralLedgerCoding>

export class UpdateService extends BaseService {
  constructor(
    protected generalLedgerCoding: GeneralLedgerCoding,
    protected attributes: GeneralLedgerCodingUpdateAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<GeneralLedgerCoding> {
    const { code } = this.attributes
    if (!isNil(code)) {
      await this.assertCodeIsValidInYgFinancialSystem(code)
    }

    await this.generalLedgerCoding.update(this.attributes)
    // TODO: log that the current user performed this action

    return this.generalLedgerCoding
  }

  private async assertCodeIsValidInYgFinancialSystem(code: string): Promise<void> {
    const account = await yukonGovernmentIntegration.finance.api.v1.fetchAccountInformation(code)
    if (isNil(account)) {
      throw new Error(`Account ${code} not found in Yukon Government financial system.`)
    }
  }
}

export default UpdateService
