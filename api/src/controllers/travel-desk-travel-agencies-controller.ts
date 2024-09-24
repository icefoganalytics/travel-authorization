import { isNil } from "lodash"

import logger from "@/utils/logger"
import { TravelDeskTravelAgency } from "@/models"
import { TravelDeskTravelAgenciesPolicy } from "@/policies"
import { CreateService } from "@/services/travel-desk-travel-agencies"
import BaseController from "@/controllers/base-controller"

export class TravelDeskTravelAgenciesController extends BaseController<TravelDeskTravelAgency> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()
      console.log(`order:`, order)
      const scopedTravelDeskTravelAgencies = TravelDeskTravelAgenciesPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskTravelAgencies.count({ where })
      const travelDeskTravelAgencies = await scopedTravelDeskTravelAgencies.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      return this.response.json({
        travelDeskTravelAgencies,
        totalCount,
      })
    } catch (error) {
      logger.error("Error fetching travel desk travel agencies" + error)
      return this.response.status(400).json({
        message: `Error fetching travel desk travel agencies: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskTravelAgency = await this.loadTravelDeskTravelAgency()
      if (isNil(travelDeskTravelAgency)) {
        return this.response.status(404).json({
          message: "Travel desk travel agency not found",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelAgency)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk travel agency",
        })
      }

      return this.response.json({ travelDeskTravelAgency, policy })
    } catch (error) {
      logger.error("Error fetching travel desk travel agency" + error)
      return this.response.status(400).json({
        message: `Error fetching travel desk travel agency: ${error}`,
      })
    }
  }

  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create travel desk travel agencies",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const travelDeskTravelAgency = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({ travelDeskTravelAgency })
    } catch (error) {
      logger.error("Error creating travel desk travel agency" + error)
      return this.response.status(422).json({
        message: `Error creating travel desk travel agency: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskTravelAgency = await this.loadTravelDeskTravelAgency()
      if (isNil(travelDeskTravelAgency)) {
        return this.response.status(404).json({
          message: "Travel desk travel agency not found",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelAgency)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel desk travel agency",
        })
      }

      const permittedAttributes = policy.permitAttributes(this.request.body)
      await travelDeskTravelAgency.update(permittedAttributes)
      return this.response.json({ travelDeskTravelAgency })
    } catch (error) {
      logger.error("Error updating travel desk travel agency" + error)
      return this.response.status(422).json({
        message: `Error updating travel desk travel agency: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskTravelAgency = await this.loadTravelDeskTravelAgency()
      if (isNil(travelDeskTravelAgency)) {
        return this.response.status(404).json({
          message: "Travel desk travel agency not found",
        })
      }

      const policy = this.buildPolicy(travelDeskTravelAgency)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel desk travel agency",
        })
      }

      await travelDeskTravelAgency.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error("Error deleting travel desk travel agency" + error)
      return this.response.status(422).json({
        message: `Error deleting travel desk travel agency: ${error}`,
      })
    }
  }

  private async loadTravelDeskTravelAgency() {
    return TravelDeskTravelAgency.findByPk(this.params.travelDeskTravelAgencyId)
  }

  private buildPolicy(
    travelDeskTravelAgency: TravelDeskTravelAgency = TravelDeskTravelAgency.build()
  ) {
    return new TravelDeskTravelAgenciesPolicy(this.currentUser, travelDeskTravelAgency)
  }
}

export default TravelDeskTravelAgenciesController
