import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelDeskTravelRequest, User } from "@/models"

import { mockCurrentUser, request } from "@/support"

import { travelDeskBookingEventFactory, travelDeskTravelRequestFactory, userFactory } from "@/factories"

describe("api/src/controllers/travel-desk-travel-requests/travel-desk-booking-events-controller.ts", () => {
  describe("TravelDeskTravelRequests.TravelDeskBookingEventsController", () => {
    describe("GET /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-booking-events", () => {
      test("when the user lacks travel desk access, it denies source access before validating the locator", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events?where[bookingReference]=INVALID`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to access booking sources.",
        })
      })

      test("when the travel request no longer exists, it returns not found before validating the locator", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({ force: true })
        mockCurrentUser(officer)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events?where[bookingReference]=INVALID`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({ message: "Travel desk travel request not found." })
      })

      test("when the parent lookup fails, it returns the booking history error response", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(TravelDeskTravelRequest, "findByPk").mockRejectedValueOnce(
          new Error("Parent lookup failed.")
        )

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events?where[bookingReference]=INV001`
        )

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          message: "Failed to load booking history.",
        })
      })

      test.each(["?where[bookingReference][value]=SRC001"])(
        "when the locator condition is %s, it reports the downstream input failure",
        async (query) => {
          // Arrange
          const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
          const travelRequest = await travelDeskTravelRequestFactory.create()
          mockCurrentUser(officer)

          // Act
          const response = await request().get(
            `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events${query}`
          )

          // Assert
          expect(response.status).toEqual(400)
          expect(response.body).toEqual({
            message: "Failed to load booking history.",
          })
        }
      )

      test("when the locator has no matches, it returns empty cached history", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({ bookingReference: "SRC001" })

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({ where: { bookingReference: "not-a-known-locator" } })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [],
          totalCount: 0,
        })
      })

      test.each([
        { page: 1, travelOrderIdentifier: 940002 },
        { page: 2, travelOrderIdentifier: 940001 },
        { page: 3, travelOrderIdentifier: 940003 },
      ])("when page $page is requested, it returns newest events first with stable timestamp ties", async ({
        page,
        travelOrderIdentifier,
      }) => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940001,
          bookingReference: "SRC001",
          externalCreatedAt: new Date("2030-01-02T12:00:00Z"),
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940002,
          bookingReference: "SRC001",
          externalCreatedAt: new Date("2030-01-02T12:00:00Z"),
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940003,
          bookingReference: "SRC001",
          externalCreatedAt: new Date("2030-01-01T12:00:00Z"),
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940004,
          bookingReference: "OTHER1",
          externalCreatedAt: new Date("2030-01-03T12:00:00Z"),
        })
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(
          new Error("Source must not be read while browsing the cache")
        )

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({ where: { bookingReference: "SRC001" }, page, perPage: 1 })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [
            expect.objectContaining({
              travelOrderIdentifier,
              bookingReference: "SRC001",
            }),
          ],
          totalCount: 3,
        })
      })

      test("when filters, where, and ordering are supplied, it pages the matching history", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({
          bookingReference: "SRC001",
          eventType: "B",
          externalTravelPortIdentifier: 940001,
        })
        await travelDeskBookingEventFactory.create({
          bookingReference: "SRC001",
          eventType: "B",
          externalTravelPortIdentifier: 940002,
        })
        await travelDeskBookingEventFactory.create({ bookingReference: "SRC001", eventType: "F" })
        await travelDeskBookingEventFactory.create({ bookingReference: "OTHER1", eventType: "B" })

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({
            where: { bookingReference: "SRC001", eventType: "B" },
            "order[0][0]": "externalTravelPortIdentifier",
            "order[0][1]": "DESC",
            perPage: 1,
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [
            expect.objectContaining({
              travelOrderIdentifier: 940002,
              bookingReference: "SRC001",
              eventType: "B",
            }),
          ],
          totalCount: 2,
        })
      })

      test("when a page is beyond cached history, it returns an empty page with the matching total", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({ bookingReference: "SRC001" })
        await travelDeskBookingEventFactory.create({ bookingReference: "OTHER1" })

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({ where: { bookingReference: "SRC001" }, page: 2, perPage: 1 })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [],
          totalCount: 1,
        })
      })
    })
  })
})
