import { Op } from "@sequelize/core"

import { TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

describe("api/src/policies/travel-desk-travel-requests-policy.ts", () => {
  describe("TravelDeskTravelRequestsPolicy", () => {
    describe(".policyScope", () => {
      test("when user is admin, returns ALL_RECORDS_SCOPE", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })

        // Act
        const scope = TravelDeskTravelRequestsPolicy.policyScope(user1)

        // Assert
        expect(scope).toEqual(ALL_RECORDS_SCOPE)
      })

      test("when user is not admin, returns scope that includes travel authorization association with nested policy scope", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })

        // Act
        const scope = TravelDeskTravelRequestsPolicy.policyScope(user1)

        // Assert
        expect(scope).toEqual({
          include: [
            {
              association: "travelAuthorization",
              required: true,
              where: {
                [Op.or]: [
                  {
                    supervisorEmail: user1.email,
                  },
                  {
                    userId: user1.id,
                  },
                ],
              },
            },
          ],
        })
      })

      test("when user is not admin, scopes to travel desk travel requests for travel authorizations they own", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const user2 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization1 = await travelAuthorizationFactory.create({
          userId: user1.id,
        })
        const travelAuthorization2 = await travelAuthorizationFactory.create({
          userId: user2.id,
        })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization1.id,
        })
        await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization2.id,
        })

        // Act
        const scope = TravelDeskTravelRequestsPolicy.policyScope(user1)
        const scopedTravelDeskTravelRequests = await TravelDeskTravelRequest.findAll(scope)

        // Assert
        expect(scopedTravelDeskTravelRequests).toEqual([
          expect.objectContaining({
            id: travelDeskTravelRequest1.id,
          }),
        ])
      })

      test("when user is not admin, scopes to travel desk travel requests for travel authorizations they supervise", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
          email: "supervisor@test.com",
        })
        const user2 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization1 = await travelAuthorizationFactory.create({
          userId: user2.id,
          supervisorEmail: "supervisor@test.com",
        })
        const travelAuthorization2 = await travelAuthorizationFactory.create({
          userId: user2.id,
          supervisorEmail: "other-supervisor@test.com",
        })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization1.id,
        })
        await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization2.id,
        })

        // Act
        const scope = TravelDeskTravelRequestsPolicy.policyScope(user1)
        const scopedTravelDeskTravelRequests = await TravelDeskTravelRequest.findAll(scope)

        // Assert
        expect(scopedTravelDeskTravelRequests).toEqual([
          expect.objectContaining({
            id: travelDeskTravelRequest1.id,
          }),
        ])
      })

      test("when user is admin, returns all travel desk travel requests", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const user2 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization1 = await travelAuthorizationFactory.create({
          userId: user1.id,
        })
        const travelAuthorization2 = await travelAuthorizationFactory.create({
          userId: user2.id,
        })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization1.id,
        })
        const travelDeskTravelRequest2 = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization2.id,
        })

        // Act
        const scope = TravelDeskTravelRequestsPolicy.policyScope(user1)
        const scopedTravelDeskTravelRequests = await TravelDeskTravelRequest.findAll(scope)

        // Assert
        expect(scopedTravelDeskTravelRequests).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: travelDeskTravelRequest1.id,
            }),
            expect.objectContaining({
              id: travelDeskTravelRequest2.id,
            }),
          ])
        )
      })
    })

    describe("#update", () => {
      test("when user role is user, and travel authorizations belongs to user, and travel authorization status is approved, and travel desk travel request status is draft, returns true", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          supervisorEmail: "some-other-users-email@test.com",
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })
        travelDeskTravelRequest.travelAuthorization = travelAuthorization

        // Act
        const policy = new TravelDeskTravelRequestsPolicy(user, travelDeskTravelRequest)

        // Assert
        expect(policy.update()).toBe(true)
      })

      test("when user role is user, and travel authorization belongs to user, and travel authorization status is approved, and travel desk travel request status is submitted, returns false", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          supervisorEmail: "some-other-users-email@test.com",
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.SUBMITTED,
        })
        travelDeskTravelRequest.travelAuthorization = travelAuthorization

        // Act
        const policy = new TravelDeskTravelRequestsPolicy(user, travelDeskTravelRequest)

        // Assert
        expect(policy.update()).toBe(false)
      })
    })
  })
})
