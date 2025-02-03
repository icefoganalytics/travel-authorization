import { isNil } from "lodash"

import logger from "@/utils/logger"

import { AccountsReceivableInvoice } from "@/integrations/trav-com-integration/models"
import { AccountsReceivableInvoicesPolicy } from "@/integrations/trav-com-integration/policies"
import { IndexSerializer } from "@/integrations/trav-com-integration/serializers/accounts-receivable-invoices"
import BaseController from "@/controllers/base-controller"

export class AccountsReceivableInvoicesController extends BaseController<AccountsReceivableInvoice> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedAccountsReceivableInvoices = AccountsReceivableInvoicesPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedAccountsReceivableInvoices.count({ where })
      const accountsReceivableInvoices = await scopedAccountsReceivableInvoices.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        include: [
          "details",
          // "segments",
        ],
      })
      const serializedAccountsReceivableInvoices = await IndexSerializer.perform(
        accountsReceivableInvoices
      )

      return this.response.status(200).json({
        accountsReceivableInvoices: serializedAccountsReceivableInvoices,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching accounts receivable invoices: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve accounts receivable invoices: ${error}`,
      })
    }
  }

  async show() {
    try {
      const accountsReceivableInvoice = await this.loadAccountsReceivableInvoice()
      if (isNil(accountsReceivableInvoice)) {
        return this.response.status(404).json({
          message: "accounts receivable invoice not found.",
        })
      }

      const policy = this.buildPolicy(accountsReceivableInvoice)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this accounts receivable invoice.",
        })
      }

      return this.response.status(200).json({
        accountsReceivableInvoice,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching accounts receivable invoice: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve accounts receivable invoice: ${error}`,
      })
    }
  }

  private async loadAccountsReceivableInvoice() {
    return await AccountsReceivableInvoice.findByPk(this.params.accountsReceivableInvoiceId)
  }

  private buildPolicy(
    accountsReceivableInvoice: AccountsReceivableInvoice = AccountsReceivableInvoice.build()
  ) {
    return new AccountsReceivableInvoicesPolicy(this.currentUser, accountsReceivableInvoice)
  }
}

export default AccountsReceivableInvoicesController
