import { User } from "@/models"
import { TravelAuthorizationsPolicy, TravelDeskTravelAuthorizationsPolicy } from "@/policies"

import { travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-desk-travel-authorizations-policy.ts", () => {
  describe("TravelDeskTravelAuthorizationsPolicy", () => {
    describe(".applyScope", () => {
      test("when the staff collection loads first, the authorization list retains supervisor visibility", async () => {
        // Arrange
        const departmentAdmin = await userFactory.create({
          roles: [User.Roles.DEPARTMENT_ADMIN],
          department: "Finance",
        })
        const traveller = await userFactory.create({ roles: [User.Roles.USER] })
        const supervisedTravelAuthorization = await travelAuthorizationFactory.create({
          userId: traveller.id,
          department: "Finance",
          supervisorEmail: departmentAdmin.email,
        })
        const ownTravelAuthorization = await travelAuthorizationFactory.create({
          userId: departmentAdmin.id,
          department: "Operations",
        })

        // Act
        await TravelDeskTravelAuthorizationsPolicy.applyScope([], departmentAdmin).findAll()
        const scopedTravelAuthorizations = await TravelAuthorizationsPolicy.applyScope(
          [],
          departmentAdmin
        ).findAll({ order: [["id", "ASC"]] })

        // Assert
        expect(scopedTravelAuthorizations).toEqual([
          expect.objectContaining({ id: supervisedTravelAuthorization.id }),
          expect.objectContaining({ id: ownTravelAuthorization.id }),
        ])
      })

      test("when the authorization collection loads first, the staff list does not inherit supervisor access", async () => {
        // Arrange
        const departmentAdmin = await userFactory.create({
          roles: [User.Roles.DEPARTMENT_ADMIN],
          department: "Finance",
        })
        const traveller = await userFactory.create({ roles: [User.Roles.USER] })
        await travelAuthorizationFactory.create({
          userId: traveller.id,
          department: "Finance",
          supervisorEmail: departmentAdmin.email,
        })
        const ownTravelAuthorization = await travelAuthorizationFactory.create({
          userId: departmentAdmin.id,
          department: "Operations",
        })

        // Act
        await TravelAuthorizationsPolicy.applyScope([], departmentAdmin).findAll()
        const scopedTravelAuthorizations = await TravelDeskTravelAuthorizationsPolicy.applyScope(
          [],
          departmentAdmin
        ).findAll()

        // Assert
        expect(scopedTravelAuthorizations).toEqual([
          expect.objectContaining({ id: ownTravelAuthorization.id }),
        ])
      })
    })
  })
})
