import { isNil } from "lodash"

import logger from "@/utils/logger"

import { User } from "@/models"
import { UsersPolicy } from "@/policies"
import { YkGovernmentDirectorySyncService } from "@/services"
import { UsersSerializer } from "@/serializers"
import BaseController from "@/controllers/base-controller"

export class YgGovernmentDirectorySyncController extends BaseController {
  async create() {
    try {
      const user = await this.loadUser()
      if (isNil(user)) {
        return this.response.status(404).json({
          message: "User not found.",
        })
      }

      const policy = this.buildPolicy(user)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to sync this user.",
        })
      }

      const updatedUser = await YkGovernmentDirectorySyncService.perform(this.currentUser)
      const serializedUser = UsersSerializer.asDetailed(updatedUser)
      return this.response.status(200).json({
        user: serializedUser,
        policy,
      })
    } catch (error) {
      logger.error(`Error syncing user: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to sync user: ${error}`,
      })
    }
  }

  private loadUser(): Promise<User | null> {
    return User.findByPk(this.params.userId)
  }

  private buildPolicy(record: User): UsersPolicy {
    return new UsersPolicy(this.currentUser, record)
  }
}

export default YgGovernmentDirectorySyncController
