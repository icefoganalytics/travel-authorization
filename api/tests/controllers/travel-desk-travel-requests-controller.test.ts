import qs from "qs"

import { TravelDeskTravelRequest, User } from "@/models"
import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-travel-requests-controller.ts", () => {
  describe("TravelDeskTravelRequestsController", () => {
    describe("#index", () => {
      test("when requests belong to different users, it lists only visible requests and their total count", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create()
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })

        // Act
        const response = await request().get("/api/travel-desk-travel-requests")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskTravelRequests: [
            expect.objectContaining({
              id: travelDeskTravelRequest1.id,
            }),
          ],
          totalCount: 1,
        })
      })

      test("when filtering and paginating requests, it returns the requested page and the full matching count", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        const travelDeskTravelRequest2 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization2 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        const travelAuthorization3 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization3 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        const query = qs.stringify({
          where: { id: [travelDeskTravelRequest1.id, travelDeskTravelRequest2.id] },
          order: [["id", "ASC"]],
          perPage: 1,
          page: 2,
        })

        // Act
        const response = await request().get("/api/travel-desk-travel-requests").query(query)

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskTravelRequests: [
            expect.objectContaining({
              id: travelDeskTravelRequest2.id,
            }),
          ],
          totalCount: 2,
        })
      })
    })
  })
})
