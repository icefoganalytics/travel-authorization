import { isNil } from "lodash"

import logger from "@/utils/logger"
import { YgEmployee } from "@/models"
import { YgEmployeesPolicy } from "@/policies"
import BaseController from "@/controllers/base-controller"

export class YgEmployeesController extends BaseController<YgEmployee> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["fullName", "ASC"]])

      const scopedYgEmployees = YgEmployeesPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedYgEmployees.count({ where })
      const ygEmployees = await scopedYgEmployees.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.status(200).json({
        ygEmployees,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching Yukon government employees: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching Yukon government employees: ${error}`,
      })
    }
  }

  async show() {
    const ygEmployee = await this.loadYgEmployee()
    if (isNil(ygEmployee)) {
      return this.response.status(404).json({
        message: "Yukon government employee not found",
      })
    }

    const policy = this.buildPolicy(ygEmployee)
    if (!policy.show()) {
      return this.response.status(403).json({
        message: "You are not authorized to view this Yukon government employee.",
      })
    }

    return this.response.status(200).json({
      ygEmployee,
      policy,
    })
  }

  async loadYgEmployee() {
    return YgEmployee.findByPk(this.params.ygEmployeeId)
  }

  private buildPolicy(ygEmployee: YgEmployee = YgEmployee.build()) {
    return new YgEmployeesPolicy(this.currentUser, ygEmployee)
  }
}

export default YgEmployeesController
