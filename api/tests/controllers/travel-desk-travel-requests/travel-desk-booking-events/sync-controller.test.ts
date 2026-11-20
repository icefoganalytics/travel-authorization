import { SyncService } from "@/services/travel-desk-booking-events"
import { SourceUnavailableError } from "@/services/travel-desk-booking-events/source-unavailable-error"

import { mockCurrentUser, request } from "@/support"

import { travelDeskTravelRequestFactory, userFactory, TravelPortIntegration } from "@/factories"

describe("api/src/controllers/travel-desk-travel-requests/travel-desk-booking-events/sync-controller.ts", () => {
  describe("SyncController", () => {
    describe("#create - POST /api/travel-desk-travel-requests/:travelDeskTravelRequestId/travel-desk-booking-events/sync", () => {
      test("when the user lacks travel desk access, it denies synchronization", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({
            bookingReference: "INVALID",
          })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to access booking sources.",
        })
      })

      test("when the travel request no longer exists, it returns not found", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({
            bookingReference: "INVALID",
          })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when the source is unavailable, it reports source unavailability", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelPortRecordLocator: "SRC001",
        })
        mockCurrentUser(officer)
        vi.spyOn(SyncService, "perform").mockRejectedValue(
          new SourceUnavailableError("Booking source is unavailable.")
        )

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)

        // Assert
        expect(response.status).toEqual(503)
        expect(response.body).toEqual({
          message: "Booking source is unavailable.",
        })
      })

      test("when synchronization fails unexpectedly, it returns the booking synchronization error", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelPortRecordLocator: "SRC001",
        })
        mockCurrentUser(officer)
        vi.spyOn(SyncService, "perform").mockRejectedValue(new Error("Local write failed."))

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)

        // Assert
        expect(response.status).toEqual(400)
        expect(response.body).toEqual({
          message: "Failed to sync booking history.",
        })
      })

      test("when a linked locator matches source history, it synchronizes without accepting a caller locator", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create({
          travelPortRecordLocator: "T94001",
        })
        mockCurrentUser(officer)
        await TravelPortIntegration.travelOrderEventFactory.create({
          recordLocator: "T94001",
          bookingFileVersionNumber: 3,
          eventType: "B",
        })

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({
            bookingReference: "not-a-valid-booking-reference",
          })

        // Assert
        expect(response.status).toEqual(204)
        expect(response.body).toEqual({})
      })

      test("when a request has no linked booking, it rejects synchronization despite a caller locator", async () => {
        // Arrange
        const officer = await userFactory.asTravelDeskUser().create()
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events/sync`)
          .send({
            bookingReference: "T94001",
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Link a Travelport booking to this travel request first.",
        })
      })
    })
  })
})
