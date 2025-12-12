import { isNil } from "lodash"

import { PerDiem } from "@/models"
import { PerDiemsPolicy } from "@/policies"
import { UpdateService } from "@/services/per-diems"

import BaseController from "@/controllers/base-controller"

export class PerDiemsController extends BaseController<PerDiem> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes(["claimTypeTimeOrder", "travelRegionDistanceOrder"])
      const order = this.buildOrder([
        ["claimTypeTimeOrder", "ASC"],
        ["claimType", "ASC"],
        ["travelRegionDistanceOrder", "ASC"],
      ])
      const scopedPerDiems = PerDiemsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedPerDiems.count({ where })
      const perDiems = await scopedPerDiems.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.status(200).json({
        perDiems,
        totalCount,
      })
    } catch (error) {
      return this.response.status(500).json({
        message: `Failed to retrieve per diems: ${error}`,
      })
    }
  }

  async show() {
    try {
      const perDiem = await this.loadPerDiem()
      if (isNil(perDiem)) {
        return this.response.status(404).json({
          message: "Per diem not found.",
        })
      }

      const policy = this.buildPolicy(perDiem)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this per diem.",
        })
      }

      return this.response.status(200).json({
        perDiem,
        policy,
      })
    } catch (error) {
      return this.response.status(400).json({
        message: `Failed to retrieve per diem: ${error}`,
      })
    }
  }

  async update() {
    try {
      const perDiem = await this.loadPerDiem()
      if (isNil(perDiem)) {
        return this.response.status(404).json({
          message: "Per diem not found.",
        })
      }

      const policy = this.buildPolicy(perDiem)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this per diem.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedPerDiem = await UpdateService.perform(
        perDiem,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        perDiem: updatedPerDiem,
        policy,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Per diem update failed: ${error}`,
      })
    }
  }

  private loadPerDiem(): Promise<PerDiem | null> {
    return PerDiem.findByPk(this.params.perDiemId)
  }

  private buildPolicy(perDiem: PerDiem) {
    return new PerDiemsPolicy(this.currentUser, perDiem)
  }
}

export default PerDiemsController
