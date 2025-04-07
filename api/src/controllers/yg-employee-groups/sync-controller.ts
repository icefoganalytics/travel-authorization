import logger from "@/utils/logger"

import { YgEmployeeGroup } from "@/models"
import { YgEmployeeGroupsPolicy } from "@/policies"
import { SyncService } from "@/services/yg-employee-groups"
import BaseController from "@/controllers/base-controller"

export class SyncController extends BaseController<YgEmployeeGroup> {
  async create() {
    try {
      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to sync Yukon government employee groups.",
        })
      }

      await SyncService.perform()
      return this.response.status(200).json({
        message: "Yukon government employee groups synced successfully.",
      })
    } catch (error) {
      logger.error(`Failed to sync Yukon government employee groups: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to sync Yukon government employee groups: ${error}`,
      })
    }
  }

  private buildPolicy(ygEmployeeGroup = YgEmployeeGroup.build()): YgEmployeeGroupsPolicy {
    return new YgEmployeeGroupsPolicy(this.currentUser, ygEmployeeGroup)
  }
}

export default SyncController
