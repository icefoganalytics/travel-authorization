import { isNil } from "lodash"

import logger from "@/utils/logger"

import { ArInvoiceDetail } from "@/integrations/trav-com-integration/models"
import { ArInvoiceDetailsPolicy } from "@/integrations/trav-com-integration/policies"
import { IndexSerializer } from "@/integrations/trav-com-integration/serializers/ar-invoice-details"
import BaseController from "@/controllers/base-controller"

export class ArInvoiceDetailsController extends BaseController<ArInvoiceDetail> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedArInvoiceDetails = ArInvoiceDetailsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedArInvoiceDetails.count({ where })
      const arInvoiceDetails = await scopedArInvoiceDetails.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        include: [
          "invoice",
          // "segments",
        ],
      })
      const serializedArInvoiceDetails = await IndexSerializer.perform(arInvoiceDetails)

      return this.response.status(200).json({
        arInvoiceDetails: serializedArInvoiceDetails,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching AR invoice details: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve AR invoice details: ${error}`,
      })
    }
  }

  async show() {
    try {
      const arInvoiceDetail = await this.loadArInvoiceDetail()
      if (isNil(arInvoiceDetail)) {
        return this.response.status(404).json({
          message: "AR invoice detail not found.",
        })
      }

      const policy = this.buildPolicy(arInvoiceDetail)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this AR invoice detail.",
        })
      }

      return this.response.status(200).json({
        arInvoiceDetail,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching AR invoice detail: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve AR invoice detail: ${error}`,
      })
    }
  }

  private async loadArInvoiceDetail() {
    return await ArInvoiceDetail.findByPk(this.params.arInvoiceDetailId)
  }

  private buildPolicy(arInvoiceDetail: ArInvoiceDetail = ArInvoiceDetail.build()) {
    return new ArInvoiceDetailsPolicy(this.currentUser, arInvoiceDetail)
  }
}

export default ArInvoiceDetailsController
