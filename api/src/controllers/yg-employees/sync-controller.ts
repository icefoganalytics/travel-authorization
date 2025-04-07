import logger from "@/utils/logger"

import { YgEmployee } from "@/models"
import { YgEmployeesPolicy } from "@/policies"
import { SyncService } from "@/services/yg-employees"
import BaseController from "@/controllers/base-controller"

export class SyncController extends BaseController<YgEmployee> {
  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to sync Yukon government employees.",
        })
      }

      await SyncService.perform()
      return this.response.status(200).json({
        message: "Yukon government employees synced successfully.",
      })
    } catch (error) {
      logger.error(`Failed to sync Yukon government employees: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to sync Yukon government employees: ${error}`,
      })
    }
  }

  private buildPolicy(ygEmployee = YgEmployee.build()): YgEmployeesPolicy {
    return new YgEmployeesPolicy(this.currentUser, ygEmployee)
  }
}

export default SyncController
