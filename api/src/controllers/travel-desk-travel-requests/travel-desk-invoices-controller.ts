import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskInvoice, TravelDeskTravelRequest } from "@/models"

import { TravelDeskInvoicesPolicy, TravelDeskTravelRequests } from "@/policies"

import { CreateService, DestroyService, UpdateService } from "@/services/travel-desk-invoices"

import { IndexSerializer, ShowSerializer } from "@/serializers/travel-desk-invoices"

import BaseController from "@/controllers/base-controller"

export class TravelDeskInvoicesController extends BaseController<TravelDeskInvoice> {
  async index() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const travelDeskTravelRequestPolicy =
        this.buildTravelDeskTravelRequestPolicy(travelDeskTravelRequest)
      if (!travelDeskTravelRequestPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const where = this.buildWhere(
        {},
        {
          travelDeskTravelRequestId: travelDeskTravelRequest.id,
        }
      )
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ])
      const scopedTravelDeskInvoices = TravelDeskInvoicesPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelDeskInvoices.count({ where })
      const travelDeskInvoices = await scopedTravelDeskInvoices.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
        include: [
          {
            association: "items",
            separate: true,
            include: ["productType"],
          },
        ],
      })

      const serializedTravelDeskInvoices = IndexSerializer.perform(travelDeskInvoices)

      return this.response.status(200).json({
        travelDeskInvoices: serializedTravelDeskInvoices,
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to index travel desk invoices: ${error}`, { error })
      return this.response.status(400).json({
        message: "Failed to load invoices.",
      })
    }
  }

  async show() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const travelDeskTravelRequestPolicy =
        this.buildTravelDeskTravelRequestPolicy(travelDeskTravelRequest)
      if (!travelDeskTravelRequestPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const travelDeskInvoice = await this.loadTravelDeskInvoice(travelDeskTravelRequest)
      if (isNil(travelDeskInvoice)) {
        return this.response.status(404).json({
          message: "Invoice not found.",
        })
      }

      const travelDeskInvoicePolicy = this.buildPolicy(travelDeskInvoice)
      if (!travelDeskInvoicePolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const serializedTravelDeskInvoice = ShowSerializer.perform(travelDeskInvoice)
      return this.response.status(200).json({
        travelDeskInvoice: serializedTravelDeskInvoice,
      })
    } catch (error) {
      logger.error(`Failed to show travel desk invoice: ${error}`, { error })
      return this.response.status(400).json({
        message: "Failed to load invoice.",
      })
    }
  }

  async create() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const travelDeskTravelRequestPolicy =
        this.buildTravelDeskTravelRequestPolicy(travelDeskTravelRequest)
      if (!travelDeskTravelRequestPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const travelDeskInvoice = TravelDeskInvoice.build()
      const travelDeskInvoicePolicy = this.buildPolicy(travelDeskInvoice)
      if (!travelDeskInvoicePolicy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const permittedAttributes = travelDeskInvoicePolicy.permitAttributesForCreate(
        this.request.body
      )
      const createdTravelDeskInvoice = await CreateService.perform(
        travelDeskTravelRequest,
        permittedAttributes
      )
      const serializedTravelDeskInvoice = ShowSerializer.perform(createdTravelDeskInvoice)
      return this.response.status(201).json({
        travelDeskInvoice: serializedTravelDeskInvoice,
      })
    } catch (error) {
      logger.error(`Failed to create travel desk invoice: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to create invoice: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const travelDeskTravelRequestPolicy =
        this.buildTravelDeskTravelRequestPolicy(travelDeskTravelRequest)
      if (!travelDeskTravelRequestPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const travelDeskInvoice = await this.loadTravelDeskInvoice(travelDeskTravelRequest)
      if (isNil(travelDeskInvoice)) {
        return this.response.status(404).json({
          message: "Invoice not found.",
        })
      }

      const travelDeskInvoicePolicy = this.buildPolicy(travelDeskInvoice)
      if (!travelDeskInvoicePolicy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const permittedAttributes = travelDeskInvoicePolicy.permitAttributesForUpdate(
        this.request.body
      )
      const updatedTravelDeskInvoice = await UpdateService.perform(
        travelDeskInvoice,
        permittedAttributes
      )
      const serializedTravelDeskInvoice = ShowSerializer.perform(updatedTravelDeskInvoice)
      return this.response.status(200).json({
        travelDeskInvoice: serializedTravelDeskInvoice,
      })
    } catch (error) {
      logger.error(`Failed to update travel desk invoice: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update invoice: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskTravelRequest = await this.loadTravelDeskTravelRequest()
      if (isNil(travelDeskTravelRequest)) {
        return this.response.status(404).json({
          message: "Travel desk travel request not found.",
        })
      }

      const travelDeskTravelRequestPolicy =
        this.buildTravelDeskTravelRequestPolicy(travelDeskTravelRequest)
      if (!travelDeskTravelRequestPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      const travelDeskInvoice = await this.loadTravelDeskInvoice(travelDeskTravelRequest)
      if (isNil(travelDeskInvoice)) {
        return this.response.status(404).json({
          message: "Invoice not found.",
        })
      }

      const travelDeskInvoicePolicy = this.buildPolicy(travelDeskInvoice)
      if (!travelDeskInvoicePolicy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to manage invoices.",
        })
      }

      await DestroyService.perform(travelDeskInvoice)
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Failed to destroy travel desk invoice: ${error}`, { error })
      return this.response.status(422).json({
        message: "Invoice could not be deleted.",
      })
    }
  }

  private async loadTravelDeskInvoice(
    travelDeskTravelRequest: TravelDeskTravelRequest
  ): Promise<TravelDeskInvoice | null> {
    return TravelDeskInvoice.findOne({
      where: {
        id: this.params.travelDeskInvoiceId,
        travelDeskTravelRequestId: travelDeskTravelRequest.id,
      },
      include: [
        {
          association: "items",
          include: ["productType"],
        },
      ],
    })
  }

  private loadTravelDeskTravelRequest(): Promise<TravelDeskTravelRequest | null> {
    return TravelDeskTravelRequest.findByPk(this.params.travelDeskTravelRequestId)
  }

  private buildTravelDeskTravelRequestPolicy(
    travelDeskTravelRequest: TravelDeskTravelRequest
  ): TravelDeskTravelRequests.TravelDeskInvoicesPolicy {
    return new TravelDeskTravelRequests.TravelDeskInvoicesPolicy(
      this.currentUser,
      travelDeskTravelRequest
    )
  }

  private buildPolicy(travelDeskInvoice: TravelDeskInvoice): TravelDeskInvoicesPolicy {
    return new TravelDeskInvoicesPolicy(this.currentUser, travelDeskInvoice)
  }
}

export default TravelDeskInvoicesController
