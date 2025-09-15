import { CreationAttributes } from "@sequelize/core"
import { isEmpty, isUndefined } from "lodash"

import db from "@/db/db-client"

import logger from "@/utils/logger"
import BaseService from "@/services/base-service"
import { User } from "@/models"
import { YkGovernmentDirectorySyncService } from "@/services"

type AttributesWithDefaults = "sub" | "email" | "roles" | "status"
export type UserCreationAttributes = Omit<CreationAttributes<User>, AttributesWithDefaults> &
  Partial<Pick<User, AttributesWithDefaults>>

export type UserCreationOptions = {
  skipSync?: boolean
}

export class CreateService extends BaseService {
  constructor(
    private attributes: UserCreationAttributes,
    private currentUser: User,
    private options: UserCreationOptions = {}
  ) {
    super()
    this.options = {
      skipSync: false,
      ...options,
    }
  }

  async perform(): Promise<User> {
    const { sub, email, firstName, lastName, roles, status } = this.attributes

    let fallbackEmail: string = ""
    let fallbackFirstName: string = ""
    let fallbackLastName: string = ""
    if (!isUndefined(email) && !isEmpty(email)) {
      const names = email.split("@")[0].split(".")
      fallbackFirstName = names[0] || ""
      fallbackLastName = names[1] || ""
    } else if (!isEmpty(firstName) && !isEmpty(lastName)) {
      fallbackEmail = `${firstName}.${lastName}@yukon-no-email.ca`
    } else {
      throw new Error("Email or first and last name must be provided.")
    }

    const attributesWithDefaults = {
      ...this.attributes,
      sub: sub || "UNSET",
      email: email || fallbackEmail,
      firstName: firstName || fallbackFirstName,
      lastName: lastName || fallbackLastName,
      roles: roles || [User.Roles.USER],
      status: status || User.Statuses.ACTIVE,
    }

    return db.transaction(async () => {
      const user = await User.create(attributesWithDefaults).catch((error) => {
        throw new Error(`Could not create User: ${error}`)
      })

      // TODO: log creator of this user?

      if (this.options.skipSync !== true) {
        try {
          await YkGovernmentDirectorySyncService.perform(user)
        } catch (error) {
          logger.error(`Failed to sync new user with YG employee directory: ${error}`)
        }
      }

      return user
    })
  }
}

export default CreateService
