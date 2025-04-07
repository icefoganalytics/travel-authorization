import { isNil } from "lodash"

import logger from "@/utils/logger"
import { YgEmployeeGroup } from "@/models"
import { YgEmployeeGroupsPolicy } from "@/policies"
import { IndexSerializer, ShowSerializer } from "@/serializers/yg-employee-groups"
import BaseController from "@/controllers/base-controller"

export class YgEmployeeGroupsController extends BaseController<YgEmployeeGroup> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["department", "ASC"],
        ["division", "ASC"],
        ["branch", "ASC"],
        ["unit", "ASC"],
        ["order", "ASC"],
      ])

      const scopedYgEmployeeGroups = YgEmployeeGroupsPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedYgEmployeeGroups.count({ where })
      const ygEmployeeGroups = await scopedYgEmployeeGroups.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      const serializedYgEmployeeGroups = IndexSerializer.perform(ygEmployeeGroups, this.currentUser)
      return this.response.status(200).json({
        ygEmployeeGroups: serializedYgEmployeeGroups,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching Yukon government employee groups: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching Yukon government employee groups: ${error}`,
      })
    }
  }

  async show() {
    const ygEmployeeGroup = await this.loadYgEmployeeGroup()
    if (isNil(ygEmployeeGroup)) {
      return this.response.status(404).json({
        message: "Yukon government employee group not found",
      })
    }

    const policy = this.buildPolicy(ygEmployeeGroup)
    if (!policy.show()) {
      return this.response.status(403).json({
        message: "You are not authorized to view this Yukon government employee group.",
      })
    }

    const serializedYgEmployeeGroup = ShowSerializer.perform(ygEmployeeGroup, this.currentUser)
    return this.response.status(200).json({
      ygEmployeeGroup: serializedYgEmployeeGroup,
      policy,
    })
  }

  async loadYgEmployeeGroup() {
    return YgEmployeeGroup.findByPk(this.params.ygEmployeeGroupId)
  }

  private buildPolicy(ygEmployeeGroup: YgEmployeeGroup = YgEmployeeGroup.build()) {
    return new YgEmployeeGroupsPolicy(this.currentUser, ygEmployeeGroup)
  }
}

export default YgEmployeeGroupsController
