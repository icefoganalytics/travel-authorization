import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { User } from "@/models"

const baseUserFactory = FactoryShark.define(User, ({ params }) => {
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

export const userFactory = Object.assign(baseUserFactory, {
  asAdmin() {
    return baseUserFactory.params({ roles: [User.Roles.ADMIN] })
  },

  asPreApprovedTravelAdmin() {
    return baseUserFactory.params({ roles: [User.Roles.PRE_APPROVED_TRAVEL_ADMIN] })
  },
})

export default userFactory
