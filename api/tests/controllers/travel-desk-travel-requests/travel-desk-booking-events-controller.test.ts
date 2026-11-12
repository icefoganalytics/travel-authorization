import sourceDatabase from "@/integrations/travel-port-integration/db/db-migration-client"
import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelDeskTravelRequest, User } from "@/models"
import { SyncService } from "@/services/travel-desk-booking-events"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

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
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events?recordLocator=INVALID`
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
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events?recordLocator=INVALID`
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
          `/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events?recordLocator=INV001`
        )

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          message: "Failed to load booking history.",
        })
      })

      test.each([
        "",
        "?recordLocator=",
        "?recordLocator=INVALID",
        "?recordLocator[]=SRC001",
        "?recordLocator[value]=SRC001",
      ])(
        "when the locator query is %s, it rejects missing, invalid, or non-string inputs",
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
          expect(response.status).toEqual(422)
          expect(response.body).toEqual({
            message: "Record locator must contain six letters or numbers.",
          })
        }
      )

      test.each([
        { page: 1, travelOrderIdentifier: 940001 },
        { page: 2, travelOrderIdentifier: 940002 },
      ])("when page $page is requested, it returns only that stable page of cached history", async ({
        page,
        travelOrderIdentifier,
      }) => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940002,
          recordLocator: "SRC001",
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940001,
          recordLocator: "SRC001",
        })
        await travelDeskBookingEventFactory.create({
          externalTravelPortIdentifier: 940003,
          recordLocator: "OTHER1",
        })
        vi.spyOn(TravelOrderEvent, "findAll").mockRejectedValue(
          new Error("Source must not be read while browsing the cache")
        )

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({ recordLocator: " src001 ", page, perPage: 1 })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [
            expect.objectContaining({
              travelOrderIdentifier,
              recordLocator: "SRC001",
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
        await travelDeskBookingEventFactory.create({ recordLocator: "SRC001" })
        await travelDeskBookingEventFactory.create({ recordLocator: "OTHER1" })

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({ recordLocator: "SRC001", page: 2, perPage: 1 })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [],
          totalCount: 1,
        })
      })
    })

    describe("POST /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-booking-events", () => {
      test("when the user lacks travel desk access, it denies synchronization before validating the locator", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .send({ recordLocator: "INVALID" })

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
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .send({ recordLocator: "INVALID" })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({ message: "Travel desk travel request not found." })
      })

      test.each([undefined, "", "INVALID", ["SRC001"], { value: "SRC001" }])(
        "when the locator body is %j, it rejects missing, invalid, or non-string inputs",
        async (recordLocator) => {
          // Arrange
          const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
          const travelRequest = await travelDeskTravelRequestFactory.create()
          mockCurrentUser(officer)

          // Act
          const response = await request()
            .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
            .send({ recordLocator })

          // Assert
          expect(response.status).toEqual(422)
          expect(response.body).toEqual({
            message: "Record locator must contain six letters or numbers.",
          })
        }
      )

      test("when the source is unavailable, it reports source unavailability", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(SyncService, "perform").mockRejectedValue(
          new SourceUnavailableError("Booking source is unavailable.")
        )

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .send({ recordLocator: "SRC001" })

        // Assert
        expect(response.status).toEqual(503)
        expect(response.body).toEqual({ message: "Booking source is unavailable." })
      })

      test("when synchronization fails unexpectedly, it returns the booking synchronization error", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        vi.spyOn(SyncService, "perform").mockRejectedValue(new Error("Local write failed."))

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .send({ recordLocator: "SRC001" })

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({ message: "Failed to sync booking history." })
      })

      test("when a normalized locator matches source history, it synchronizes without returning a collection", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await sourceDatabase("Passenger").whereIn("TravelOrderIdentifier", [940001, 940002]).del()
        await sourceDatabase("AirRsrvSeg").whereIn("TravelOrderIdentifier", [940001, 940002]).del()
        await sourceDatabase("SFTrans").whereIn("TravelOrderIdentifier", [940001, 940002]).del()
        await sourceDatabase("TravelOrderEvent")
          .whereIn("TravelOrderIdentifier", [940001, 940002])
          .del()
        await sourceDatabase("TravelOrderEvent").insert({
          TravelOrderIdentifier: 940001,
          RecordLocator: "T94001",
          PnrBfVersionNbr: 3,
          EventType: "B",
          DatabaseTimeStamp: "2030-01-01T12:00:00",
        })

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .send({ recordLocator: " t94001 " })

        // Assert
        expect(response.status).toEqual(204)
        expect(response.body).toEqual({})
      })
    })
  })
})
