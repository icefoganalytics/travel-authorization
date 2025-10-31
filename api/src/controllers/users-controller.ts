import { isNil } from "lodash"

import logger from "@/utils/logger"

import { User } from "@/models"
import { UsersPolicy } from "@/policies"
import { UsersSerializer } from "@/serializers"
import { CreateService, UpdateService } from "@/services/users"
import BaseController from "@/controllers/base-controller"

export class UsersController extends BaseController<User> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()
      const scopedUsers = UsersPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedUsers.count({ where })
      const users = await scopedUsers.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      return this.response.json({
        users,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching users: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve users: ${error}`,
      })
    }
  }

  async show() {
    const user = await this.loadUser()
    if (isNil(user)) {
      return this.response.status(404).json({
        message: "User not found.",
      })
    }

    const policy = this.buildPolicy(user)
    if (!policy.show()) {
      return this.response.status(403).json({
        message: "You are not authorized to view this user.",
      })
    }

    const serializedUser = UsersSerializer.asDetailed(user)
    return this.response.status(200).json({
      user: serializedUser,
      policy,
    })
  }

  async create() {
    try {
      const newUser = await this.buildUser()
      const policy = this.buildPolicy(newUser)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this user.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const user = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({
        user,
      })
    } catch (error) {
      logger.error(`Error creating user: ${error}`, { error })
      return this.response.status(422).json({
        message: `User creation failed: ${error}`,
      })
    }
  }

  async update() {
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
          message: "You are not authorized to update this user.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedUser = await UpdateService.perform(user, permittedAttributes, this.currentUser)
      const serializedUser = UsersSerializer.asDetailed(updatedUser)
      return this.response.status(200).json({
        user: serializedUser,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating user: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to update user: ${error}`,
      })
    }
  }

  private async buildUser() {
    const attributes = this.request.body
    const user = User.build(attributes)
    return user
  }

  private loadUser(): Promise<User | null> {
    return User.findByPk(this.params.userId)
  }

  private buildPolicy(record: User): UsersPolicy {
    return new UsersPolicy(this.currentUser, record)
  }
}

export default UsersController
