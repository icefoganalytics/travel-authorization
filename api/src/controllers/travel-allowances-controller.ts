import { isNil } from "lodash"

import { TravelAllowance } from "@/models"
import { TravelAllowancesPolicy } from "@/policies"
import { UpdateService } from "@/services/travel-allowances"

import BaseController from "@/controllers/base-controller"

export class TravelAllowancesController extends BaseController<TravelAllowance> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()
      const scopedTravelAllowances = TravelAllowancesPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedTravelAllowances.count({ where })
      const travelAllowances = await scopedTravelAllowances.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.status(200).json({
        travelAllowances,
        totalCount,
      })
    } catch (error) {
      return this.response.status(500).json({
        message: `Failed to retrieve travel allowances: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelAllowance = await this.loadTravelAllowance()
      if (isNil(travelAllowance)) {
        return this.response.status(404).json({
          message: "Travel allowance not found.",
        })
      }

      const policy = this.buildPolicy(travelAllowance)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel allowance.",
        })
      }

      return this.response.status(200).json({
        travelAllowance,
        policy,
      })
    } catch (error) {
      return this.response.status(400).json({
        message: `Failed to retrieve travel allowance: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelAllowance = await this.loadTravelAllowance()
      if (isNil(travelAllowance)) {
        return this.response.status(404).json({
          message: "Travel allowance not found.",
        })
      }

      const policy = this.buildPolicy(travelAllowance)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this travel allowance.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelAllowance = await UpdateService.perform(
        travelAllowance,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        travelAllowance: updatedTravelAllowance,
        policy,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Travel allowance update failed: ${error}`,
      })
    }
  }

  private loadTravelAllowance(): Promise<TravelAllowance | null> {
    return TravelAllowance.findByPk(this.params.travelAllowanceId)
  }

  private buildPolicy(travelAllowance: TravelAllowance) {
    return new TravelAllowancesPolicy(this.currentUser, travelAllowance)
  }
}

export default TravelAllowancesController
