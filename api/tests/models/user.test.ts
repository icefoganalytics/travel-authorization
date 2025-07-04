import { User } from "@/models"

import { userFactory } from "@/factories"

describe("api/src/models/user.ts", () => {
  describe("User", () => {
    describe("#roles", async () => {
      test("when passed an array of strings updates the roles column correctly", async () => {
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        expect(user.roles).toEqual([User.Roles.ADMIN])
      })
    })

    describe(".withScope", () => {
      describe("#isTravelDeskUser", () => {
        test("returns users with the travel desk user role", async () => {
          const user = await userFactory.create({
            roles: [User.Roles.TRAVEL_DESK_USER],
          })
          await userFactory.create({
            roles: [User.Roles.ADMIN],
          })

          const users = await User.withScope("isTravelDeskUser").findAll()

          const userIds = users.map((user) => user.id)
          expect(userIds).toEqual([user.id])
        })
      })
    })
  })
})
