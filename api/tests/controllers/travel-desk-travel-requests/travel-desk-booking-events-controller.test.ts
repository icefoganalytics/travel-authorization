import sourceDatabase from "@/integrations/travelport-integration/db/db-migration-client"
import { TravelDeskTravelRequest, User } from "@/models"

import { mockCurrentUser, request } from "@/support"

import { travelDeskTravelRequestFactory, userFactory } from "@/factories"

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

      test("when the source table is unavailable, it reports source unavailability", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(officer)
        await sourceDatabase.schema.renameTable("TravelOrderEvent", "UnavailableTravelOrderEvent")

        try {
          // Act
          const response = await request()
            .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
            .query({ recordLocator: "SRC001" })

          // Assert
          expect(response.status).toEqual(503)
          expect(response.body).toEqual({ message: "Booking source is unavailable." })
        } finally {
          await sourceDatabase.schema.renameTable("UnavailableTravelOrderEvent", "TravelOrderEvent")
        }
      })

      test("when a normalized locator matches source history, it returns only its real source events", async () => {
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
        await sourceDatabase("TravelOrderEvent").insert([
          {
            TravelOrderIdentifier: 940001,
            RecordLocator: "T94001",
            PnrBfVersionNbr: 3,
            EventType: "B",
            DatabaseTimeStamp: "2030-01-01T12:00:00",
          },
          {
            TravelOrderIdentifier: 940002,
            RecordLocator: "OTHER1",
            PnrBfVersionNbr: 1,
            EventType: "B",
            DatabaseTimeStamp: "2030-01-02T12:00:00",
          },
        ])
        await sourceDatabase("AirRsrvSeg").insert({
          TravelOrderIdentifier: 940001,
          AirSegmentNbr: 1,
          SegmentStatus: "GK",
          CarrierCode: "ZZ",
          BoardPoint: "YXY",
          OffPoint: "YVR",
          FlightNbr: "1001",
        })

        // Act
        const response = await request()
          .get(`/api/travel-desk-travel-requests/${travelRequest.id}/travel-desk-booking-events`)
          .query({ recordLocator: " t94001 " })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskBookingEvents: [
            expect.objectContaining({
              travelOrderIdentifier: 940001,
              recordLocator: "T94001",
              bookingFileVersionNumber: 3,
              eventType: "B",
              passengers: [],
              airReservationSegments: [
                expect.objectContaining({
                  airSegmentNumber: 1,
                  carrierCode: "ZZ",
                  flightNumber: "1001",
                  boardPoint: "YXY",
                  offPoint: "YVR",
                }),
              ],
              serviceFeeTransaction: null,
            }),
          ],
        })
      })
    })
  })
})
