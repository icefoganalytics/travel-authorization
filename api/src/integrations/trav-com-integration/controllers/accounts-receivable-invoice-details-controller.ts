import { isNil } from "lodash"

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
      const order = this.buildOrder()

      const scopedAccountsReceivableInvoiceDetails =
        AccountsReceivableInvoiceDetailsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedAccountsReceivableInvoiceDetails.count({ where })
      const accountsReceivableInvoiceDetails = await scopedAccountsReceivableInvoiceDetails.findAll(
        {
          where,
          limit: this.pagination.limit,
          offset: this.pagination.offset,
          order,
          include: ["invoice", "segments"],
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

  async show() {
    try {
      const accountsReceivableInvoiceDetail = await this.loadAccountsReceivableInvoiceDetail()
      if (isNil(accountsReceivableInvoiceDetail)) {
        return this.response.status(404).json({
          message: "Accounts receivable invoice detail not found.",
        })
      }

      const policy = this.buildPolicy(accountsReceivableInvoiceDetail)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this accounts receivable invoice detail.",
        })
      }

      return this.response.status(200).json({
        accountsReceivableInvoiceDetail,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching accounts receivable invoice detail: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve accounts receivable invoice detail: ${error}`,
      })
    }
  }

  private async loadAccountsReceivableInvoiceDetail() {
    return await AccountsReceivableInvoiceDetail.findByPk(
      this.params.accountsReceivableInvoiceDetailId
    )
  }

  private buildPolicy(
    accountsReceivableInvoiceDetail: AccountsReceivableInvoiceDetail = AccountsReceivableInvoiceDetail.build()
  ) {
    return new AccountsReceivableInvoiceDetailsPolicy(
      this.currentUser,
      accountsReceivableInvoiceDetail
    )
  }
}

export default AccountsReceivableInvoiceDetailsController
