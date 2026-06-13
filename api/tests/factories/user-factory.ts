import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { User } from "@/models"

export const userFactory = Factory.define<User>(({ params, onCreate }) => {
  onCreate((user) => {
    try {
      return user.save()
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create User with attributes: ${JSON.stringify(user.dataValues, null, 2)}`
      )
    }
  })

  const firstName = params.firstName || faker.person.firstName()
  const lastName = params.lastName || faker.person.lastName()

  return User.build({
    sub: `auth0|${faker.string.uuid()}`,
    email: faker.internet.email({ firstName, lastName }),
    status: User.Statuses.ACTIVE,
    firstName,
    lastName,
    roles: [User.Roles.USER],
  })
})

export default userFactory
