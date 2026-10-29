import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskProductType } from "@/models"
import { TravelDeskProductTypesPolicy } from "@/policies"
import { CreateService, DestroyService } from "@/services/travel-desk-product-types"
import TravelDeskProductTypesSerializer from "@/serializers/travel-desk-product-types-serializer"
import BaseController from "@/controllers/base-controller"

export class TravelDeskProductTypesController extends BaseController<TravelDeskProductType> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const scopedProductTypes = TravelDeskProductTypesPolicy.applyScope(scopes, this.currentUser)
      const totalCount = await scopedProductTypes.count({ where })
      const productTypes = await scopedProductTypes.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })

      return this.response.json({
        travelDeskProductTypes: TravelDeskProductTypesSerializer.asIndex(productTypes),
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to fetch travel desk product types: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to fetch travel desk product types: ${error}`,
      })
    }
  }

  async show() {
    try {
      const productType = await this.loadProductType()
      if (isNil(productType)) {
        return this.response.status(404).json({ message: "Travel desk product type not found." })
      }

      const policy = this.buildPolicy(productType)
      if (!policy.show()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to view this product type." })
      }

      return this.response.json({
        travelDeskProductType: TravelDeskProductTypesSerializer.asShow(productType),
        policy,
      })
    } catch (error) {
      logger.error(`Failed to fetch travel desk product type: ${error}`, { error })
      return this.response
        .status(400)
        .json({ message: `Failed to fetch travel desk product type: ${error}` })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to create product types." })
      }

      const attributes = policy.permitAttributesForCreate(this.request.body)
      const productType = await CreateService.perform(attributes, this.currentUser)
      return this.response.status(201).json({
        travelDeskProductType: TravelDeskProductTypesSerializer.asShow(productType),
      })
    } catch (error) {
      logger.error(`Failed to create travel desk product type: ${error}`, { error })
      return this.response
        .status(422)
        .json({ message: `Failed to create travel desk product type: ${error}` })
    }
  }

  async update() {
    try {
      const productType = await this.loadProductType()
      if (isNil(productType)) {
        return this.response.status(404).json({ message: "Travel desk product type not found." })
      }

      const policy = this.buildPolicy(productType)
      if (!policy.update()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to update this product type." })
      }

      await productType.update(policy.permitAttributes(this.request.body))
      return this.response.json({
        travelDeskProductType: TravelDeskProductTypesSerializer.asShow(productType),
      })
    } catch (error) {
      logger.error(`Failed to update travel desk product type: ${error}`, { error })
      return this.response
        .status(422)
        .json({ message: `Failed to update travel desk product type: ${error}` })
    }
  }

  async destroy() {
    try {
      const productType = await this.loadProductType()
      if (isNil(productType)) {
        return this.response.status(404).json({ message: "Travel desk product type not found." })
      }

      const policy = this.buildPolicy(productType)
      if (!policy.destroy()) {
        return this.response.status(403).json({ message: "This product type cannot be deleted." })
      }

      await DestroyService.perform(productType, this.currentUser)
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Failed to delete travel desk product type: ${error}`, { error })
      return this.response
        .status(422)
        .json({ message: `Failed to delete travel desk product type: ${error}` })
    }
  }

  private loadProductType() {
    return TravelDeskProductType.findByPk(this.params.travelDeskProductTypeId)
  }

  private buildPolicy(productType: TravelDeskProductType = TravelDeskProductType.build()) {
    return new TravelDeskProductTypesPolicy(this.currentUser, productType)
  }
}

export default TravelDeskProductTypesController
