import sourceDatabase from "@/integrations/travel-port-integration/db/db-migration-client"
import { User } from "@/models"
import { SyncService } from "@/services/travel-desk-booking-events"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

import { mockCurrentUser, request } from "@/support"

import { travelDeskTravelRequestFactory, userFactory } from "@/factories"

describe("api/src/controllers/travel-desk-travel-requests/travel-desk-booking-events/sync-controller.ts", () => {
  describe("TravelDeskTravelRequests.TravelDeskBookingEvents.SyncController", () => {
    describe("POST /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-booking-events/sync", () => {
      test("when the user lacks travel desk access, it denies synchronization before validating the locator", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({ bookingReference: "INVALID" })

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
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({ bookingReference: "INVALID" })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({ message: "Travel desk travel request not found." })
      })

      test.each([undefined, ["SRC001"], { value: "SRC001" }])(
        "when the locator body is %j, it rejects missing or non-string inputs",
        async (bookingReference) => {
          // Arrange
          const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
          const travelRequest = await travelDeskTravelRequestFactory.create()
          mockCurrentUser(officer)

          // Act
          const response = await request()
            .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
            .send({ bookingReference })

          // Assert
          expect(response.status).toEqual(400)
          expect(response.body).toEqual({
            message: "Failed to sync booking history.",
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
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({ bookingReference: "SRC001" })

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
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({ bookingReference: "SRC001" })

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
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({ bookingReference: "T94001" })

        // Assert
        expect(response.status).toEqual(204)
        expect(response.body).toEqual({})
      })
    })
  })
})
