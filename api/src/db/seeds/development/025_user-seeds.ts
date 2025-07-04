import { CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"
import { Knex } from "knex"

import { User } from "@/models"

export async function seed(_knex: Knex): Promise<void> {
  const usersAttributes: CreationAttributes<User>[] = [
    {
      email: "system.user@travel-auth.com",
      sub: "NO_LOGIN_system.user@travel-auth.com",
      firstName: "System",
      lastName: "User",
      department: "System Users",
      roles: [User.Roles.ADMIN],
      status: User.Statuses.ACTIVE,
    },
  ]

  for (const userAttributes of usersAttributes) {
    const email = userAttributes.email.toLowerCase()
    const user = await User.findOne({
      where: {
        email,
      },
    })

    if (!isNil(user)) {
      await user.update(userAttributes)
    } else {
      await User.create(userAttributes)
    }
  }
}
