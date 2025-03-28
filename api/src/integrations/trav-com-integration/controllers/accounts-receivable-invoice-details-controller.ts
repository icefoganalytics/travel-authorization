import logger from "@/utils/logger"

import { AccountsReceivableInvoiceDetail } from "@/integrations/trav-com-integration/models"
import { AccountsReceivableInvoiceDetailsPolicy } from "@/integrations/trav-com-integration/policies"
import { IndexSerializer } from "@/integrations/trav-com-integration/serializers/accounts-receivable-invoice-details"
import BaseController from "@/controllers/base-controller"

export class AccountsReceivableInvoiceDetailsController extends BaseController<AccountsReceivableInvoiceDetail> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes(["includeAgentNameAttribute"])
      const order = this.buildOrder([
        ["segments", "departureInfo", "ASC"],
        ["segments", "arrivalInfo", "ASC"],
      ])

      const scopedAccountsReceivableInvoiceDetails =
        AccountsReceivableInvoiceDetailsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedAccountsReceivableInvoiceDetails.count({ where })
      const accountsReceivableInvoiceDetails = await scopedAccountsReceivableInvoiceDetails.findAll(
        {
          where,
          limit: this.pagination.limit,
          offset: this.pagination.offset,
          order,
          include: [
            "invoice",
            {
              association: "segments",
              include: ["arrivalCity"],
            },
          ],
        }
      )

      const serializedAccountsReceivableInvoiceDetails = IndexSerializer.perform(
        accountsReceivableInvoiceDetails
      )
      return this.response.status(200).json({
        accountsReceivableInvoiceDetails: serializedAccountsReceivableInvoiceDetails,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching accounts receivable invoice details: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve accounts receivable invoice details: ${error}`,
      })
    }
  }
}

export default AccountsReceivableInvoiceDetailsController
