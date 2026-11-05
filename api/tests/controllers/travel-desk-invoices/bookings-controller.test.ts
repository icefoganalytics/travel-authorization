import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  User,
} from "@/models"

import { travelDeskTravelRequestFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-invoices/bookings-controller.ts", () => {
  describe("BookingsController", () => {
    describe("GET /api/travel-desk-travel-requests/:travelDeskTravelRequestId/invoice-bookings", () => {
      test("when the user lacks travel desk access, it denies booking source access", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/invoice-bookings?recordLocator=INVALID`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to access booking sources.",
        })
      })

      test("when the travel request no longer exists, it returns not found before looking up the source", async () => {
        // Arrange
        const officer = await userFactory.create({
          roles: [User.Roles.TRAVEL_DESK_USER],
        })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        await travelRequest.destroy({
          force: true,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/invoice-bookings?recordLocator=INVALID`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk travel request not found.",
        })
      })

      test("when editing without a locator, it returns only this request's live local flight segments", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        mockCurrentUser(officer)
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const otherRequest = await travelDeskTravelRequestFactory.create()
        const flightRequest1 = await TravelDeskFlightRequest.create({
          travelRequestId: travelRequest.id,
          departLocation: "Whitehorse (YT)",
          arriveLocation: "Vancouver (BC)",
          datePreference: "2030-01-01",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
        })
        const flightRequest2 = await TravelDeskFlightRequest.create({
          travelRequestId: otherRequest.id,
          departLocation: "Whitehorse (YT)",
          arriveLocation: "Vancouver (BC)",
          datePreference: "2030-01-01",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
        })
        const flightOption1 = await TravelDeskFlightOption.create({
          flightRequestId: flightRequest1.id,
          travelerId: officer.id,
          cost: "100",
          leg: "Outbound",
          duration: "2h",
        })
        const flightOption2 = await TravelDeskFlightOption.create({
          flightRequestId: flightRequest2.id,
          travelerId: officer.id,
          cost: "100",
          leg: "Outbound",
          duration: "2h",
        })
        const segment1 = await TravelDeskFlightSegment.create({
          flightOptionId: flightOption1.id,
          flightNumber: "ZZ1001",
          departAt: new Date("2030-01-01T12:00:00Z"),
          departLocation: "YXY",
          arriveAt: new Date("2030-01-01T14:00:00Z"),
          arriveLocation: "YVR",
          duration: "2h",
          status: "GK",
          class: "Y",
        })
        await TravelDeskFlightSegment.create({
          flightOptionId: flightOption2.id,
          flightNumber: "ZZ2002",
          departAt: new Date("2030-01-01T12:00:00Z"),
          departLocation: "YXY",
          arriveAt: new Date("2030-01-01T14:00:00Z"),
          arriveLocation: "YVR",
          duration: "2h",
          status: "GK",
          class: "Y",
        })
        const deletedSegment = await TravelDeskFlightSegment.create({
          flightOptionId: flightOption1.id,
          flightNumber: "ZZ3003",
          departAt: new Date("2030-01-01T12:00:00Z"),
          departLocation: "YXY",
          arriveAt: new Date("2030-01-01T14:00:00Z"),
          arriveLocation: "YVR",
          duration: "2h",
          status: "GK",
          class: "Y",
        })
        await deletedSegment.destroy()

        // Act
        const response = await request().get(
          `/api/travel-desk-travel-requests/${travelRequest.id}/invoice-bookings`
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          bookingEvents: [],
          flightSegments: [
            {
              id: segment1.id,
              flightNumber: "ZZ1001",
              departLocation: "YXY",
              arriveLocation: "YVR",
              departAt: "2030-01-01T12:00:00.000Z",
              arriveAt: "2030-01-01T14:00:00.000Z",
            },
          ],
        })
      })
    })
  })
})
