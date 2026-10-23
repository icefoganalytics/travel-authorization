import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { User } from "@/models"

import { IndexService } from "@/services/travel-desk-travel-requests"

describe("api/src/services/travel-desk-travel-requests/index-service.ts", () => {
  describe("IndexService", () => {
    describe(".perform", () => {
      test("when the user has visible requests, it returns scoped records and the total count", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const user2 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({
            user: user1,
          })
          .create()
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({
            user: user2,
          })
          .create()
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create()

        // Act
        const result = await IndexService.perform(
          {},
          [],
          [["id", "ASC"]],
          undefined,
          undefined,
          user1
        )

        // Assert
        expect(result).toEqual({
          travelDeskTravelRequests: [
            expect.objectContaining({
              id: travelDeskTravelRequest1.id,
              flightRequests: [],
              hotels: [],
              otherTransportations: [],
              passengerNameRecordDocument: null,
              rentalCars: [],
              travelAuthorization: expect.objectContaining({
                user: expect.objectContaining({
                  id: user1.id,
                }),
                travelSegments: [],
              }),
            }),
          ],
          totalCount: 1,
        })
      })

      test("when given a filter and pagination, it returns the matching page and total count", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({
            user: user1,
          })
          .create()
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create()
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({
            user: user1,
          })
          .create()
        const travelDeskTravelRequest2 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create()

        // Act
        const result = await IndexService.perform(
          { id: [travelDeskTravelRequest1.id, travelDeskTravelRequest2.id] },
          [
            { method: ["includeIsBookedAttribute"] },
            { method: ["includeTravelStartDateAttribute"] },
            { method: ["includeIsAssignedToCurrentUserAttribute", user1.displayName] },
          ],
          [["id", "ASC"]],
          1,
          1,
          user1
        )

        // Assert
        expect(result).toEqual({
          travelDeskTravelRequests: [expect.objectContaining({ id: travelDeskTravelRequest2.id })],
          totalCount: 2,
        })
      })
    })
  })
})
