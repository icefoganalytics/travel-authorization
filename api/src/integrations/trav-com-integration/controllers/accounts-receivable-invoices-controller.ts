import { isNil } from "lodash"

import logger from "@/utils/logger"

import { AccountsReceivableInvoice } from "@/integrations/trav-com-integration/models"
import { AccountsReceivableInvoicesPolicy } from "@/integrations/trav-com-integration/policies"
import {
  IndexSerializer,
  ShowSerializer,
} from "@/integrations/trav-com-integration/serializers/accounts-receivable-invoices"
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
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })

      const serializedAccountsReceivableInvoices = IndexSerializer.perform(
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
          message: "Accounts receivable invoice not found",
        })
      }

      const policy = this.buildPolicy(accountsReceivableInvoice)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this accounts receivable invoice",
        })
      }

      const serializedAccountsReceivableInvoice = ShowSerializer.perform(accountsReceivableInvoice)
      return this.response.status(200).json({
        accountsReceivableInvoice: serializedAccountsReceivableInvoice,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching accounts receivable invoice: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve accounts receivable invoice: ${error}`,
      })
    }
  }

  private loadAccountsReceivableInvoice(): Promise<AccountsReceivableInvoice | null> {
    return AccountsReceivableInvoice.findByPk(this.params.accountsReceivableInvoiceId, {
      include: [
        "details",
        {
          association: "segments",
          include: ["departureCity", "arrivalCity"],
        },
      ],
    })
  }

  private buildPolicy(accountsReceivableInvoice: AccountsReceivableInvoice) {
    return new AccountsReceivableInvoicesPolicy(this.currentUser, accountsReceivableInvoice)
  }
}

export default AccountsReceivableInvoicesController
