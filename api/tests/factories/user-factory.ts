import FactoryShark, { type GeneratorFn } from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { User } from "@/models"

class UserFactory extends FactoryShark<User> {
  constructor(generator: GeneratorFn<User>) {
    super(User, generator, {})
  }

  asTravelDeskUser() {
    return this.params({
      roles: [User.Roles.TRAVEL_DESK_USER],
    })
  }

  asAdmin() {
    return this.params({
      roles: [User.Roles.ADMIN],
    })
  }

  asFinanceUser() {
    return this.params({ roles: [User.Roles.FINANCE_USER] })
  }

  asUser() {
    return this.params({ roles: [User.Roles.USER] })
  }
}

export const userFactory = new UserFactory(({ params }) => {
  const firstName = params.firstName || faker.person.firstName()
  const lastName = params.lastName || faker.person.lastName()

  return {
    sub: `auth0|${faker.string.uuid()}`,
    email: faker.internet.email({ firstName, lastName }),
    status: User.Statuses.ACTIVE,
    firstName,
    lastName,
    roles: [User.Roles.USER],
  }
})

export default userFactory
