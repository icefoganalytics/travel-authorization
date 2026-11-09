import { TravelDeskFlightRequest, User } from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskFlightOptionFactory,
  travelDeskFlightRequestFactory,
  travelDeskFlightSegmentFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-flight-segments-controller.ts", () => {
  describe("TravelDeskFlightSegmentsController", () => {
    describe("index", () => {
      test("when filtering for a travel request, it returns only its live local flight segments", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const travelRequest = await travelDeskTravelRequestFactory.create()
        const otherRequest = await travelDeskTravelRequestFactory.create()
        const flightRequest1 = await travelDeskFlightRequestFactory
          .associations({ travelRequest })
          .create()
        const flightRequest2 = await travelDeskFlightRequestFactory
          .associations({ travelRequest: otherRequest })
          .create()
        const flightOption1 = await travelDeskFlightOptionFactory
          .associations({ flightRequest: flightRequest1, traveler: officer })
          .create()
        const flightOption2 = await travelDeskFlightOptionFactory
          .associations({ flightRequest: flightRequest2, traveler: officer })
          .create()
        const segment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: flightOption1 })
          .create({
            flightNumber: "ZZ1001",
            departAt: new Date("2030-01-01T12:00:00Z"),
            departLocation: "YXY",
            arriveAt: new Date("2030-01-01T14:00:00Z"),
            arriveLocation: "YVR",
          })
        await travelDeskFlightSegmentFactory
          .associations({ flightOption: flightOption2 })
          .create({ flightNumber: "ZZ2002" })
        const deletedSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: flightOption1 })
          .create({ flightNumber: "ZZ3003" })
        await deletedSegment.destroy()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .get("/api/travel-desk-flight-segments")
          .query({ filters: { forTravelRequest: travelRequest.id }, perPage: -1 })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightSegments: [
            expect.objectContaining({
              id: segment.id,
              flightOptionId: flightOption1.id,
              flightNumber: "ZZ1001",
              departLocation: "YXY",
              arriveLocation: "YVR",
              departAt: "2030-01-01T12:00:00.000Z",
              arriveAt: "2030-01-01T14:00:00.000Z",
            }),
          ],
          totalCount: 1,
        })
      })

      test("when a flight option has a segment, it returns the explicit segment fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          })
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest, traveler: adminUser })
          .create({
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
          })
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create({
            flightNumber: "YT101",
            departAt: new Date("2026-10-27T15:00:00.000Z"),
            departLocation: "Whitehorse",
            arriveAt: new Date("2026-10-27T18:00:00.000Z"),
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Confirmed",
            class: "Economy",
            sortOrder: 2,
            createdAt,
          })

        // Act
        const response = await request()
          .get("/api/travel-desk-flight-segments")
          .query({ where: { id: travelDeskFlightSegment.id } })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightSegments: [
            {
              id: travelDeskFlightSegment.id,
              flightOptionId: travelDeskFlightOption.id,
              flightNumber: "YT101",
              departAt: "2026-10-27T15:00:00.000Z",
              departLocation: "Whitehorse",
              arriveAt: "2026-10-27T18:00:00.000Z",
              arriveLocation: "Vancouver",
              duration: "3 hours",
              status: "Confirmed",
              class: "Economy",
              sortOrder: 2,
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
            },
          ],
          totalCount: 1,
        })
      })
    })

    describe("show", () => {
      test("when the segment is visible, it omits the policy-only flight option association", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          })
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest, traveler: adminUser })
          .create({
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
          })
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create({
            flightNumber: "YT101",
            departAt: new Date("2026-10-27T15:00:00.000Z"),
            departLocation: "Whitehorse",
            arriveAt: new Date("2026-10-27T18:00:00.000Z"),
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Confirmed",
            class: "Economy",
            sortOrder: 2,
            createdAt,
          })

        // Act
        const response = await request().get(
          `/api/travel-desk-flight-segments/${travelDeskFlightSegment.id}`
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightSegment: {
            id: travelDeskFlightSegment.id,
            flightOptionId: travelDeskFlightOption.id,
            flightNumber: "YT101",
            departAt: "2026-10-27T15:00:00.000Z",
            departLocation: "Whitehorse",
            arriveAt: "2026-10-27T18:00:00.000Z",
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Confirmed",
            class: "Economy",
            sortOrder: 2,
            createdAt: createdAt.toISOString(),
            updatedAt: expect.any(String),
          },
          policy: {
            show: true,
            create: true,
            update: true,
            destroy: true,
          },
        })
      })

      test("when another traveller requests a segment, it rejects the request", async () => {
        // Arrange
        const traveler = await userFactory.create({ roles: [User.Roles.USER] })
        const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(currentUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: traveler })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          })
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest, traveler })
          .create({
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
          })
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create({
            flightNumber: "YT101",
            departAt: new Date("2026-10-27T15:00:00.000Z"),
            departLocation: "Whitehorse",
            arriveAt: new Date("2026-10-27T18:00:00.000Z"),
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Confirmed",
            class: "Economy",
            sortOrder: 2,
          })

        // Act
        const response = await request().get(
          `/api/travel-desk-flight-segments/${travelDeskFlightSegment.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to view this travel desk flight segment.",
        })
      })

      test("when the flight segment does not exist, it returns not found", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)

        // Act
        const response = await request().get("/api/travel-desk-flight-segments/0")

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk flight segment not found.",
        })
      })
    })

    describe("create", () => {
      test("when segment attributes are permitted, it returns the created flight fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          })
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest, traveler: adminUser })
          .create({
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
          })

        // Act
        const response = await request().post("/api/travel-desk-flight-segments").send({
          flightOptionId: travelDeskFlightOption.id,
          flightNumber: "YT101",
          departAt: "2026-10-27T15:00:00.000Z",
          departLocation: "Whitehorse",
          arriveAt: "2026-10-27T18:00:00.000Z",
          arriveLocation: "Vancouver",
          duration: "3 hours",
          status: "Confirmed",
          class: "Economy",
          sortOrder: 2,
        })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskFlightSegment: {
            id: expect.any(Number),
            flightOptionId: travelDeskFlightOption.id,
            flightNumber: "YT101",
            departAt: "2026-10-27T15:00:00.000Z",
            departLocation: "Whitehorse",
            arriveAt: "2026-10-27T18:00:00.000Z",
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Confirmed",
            class: "Economy",
            sortOrder: 2,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })
      })

      test("when required segment attributes are missing, it returns the service error", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)

        // Act
        const response = await request().post("/api/travel-desk-flight-segments").send({})

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to create travel desk flight segment: Error: Flight option ID is required.",
        })
      })
    })

    describe("update", () => {
      test("when a segment is updated, it returns the updated fields without the loaded option", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const travelDeskFlightRequest = await travelDeskFlightRequestFactory
          .associations({ travelRequest: travelDeskTravelRequest })
          .create({
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          })
        const travelDeskFlightOption = await travelDeskFlightOptionFactory
          .associations({ flightRequest: travelDeskFlightRequest, traveler: adminUser })
          .create({
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
          })
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightSegment = await travelDeskFlightSegmentFactory
          .associations({ flightOption: travelDeskFlightOption })
          .create({
            flightNumber: "YT101",
            departAt: new Date("2026-10-27T15:00:00.000Z"),
            departLocation: "Whitehorse",
            arriveAt: new Date("2026-10-27T18:00:00.000Z"),
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Confirmed",
            class: "Economy",
            sortOrder: 2,
            createdAt,
          })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-flight-segments/${travelDeskFlightSegment.id}`)
          .send({ status: "Delayed", sortOrder: 1 })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightSegment: {
            id: travelDeskFlightSegment.id,
            flightOptionId: travelDeskFlightOption.id,
            flightNumber: "YT101",
            departAt: "2026-10-27T15:00:00.000Z",
            departLocation: "Whitehorse",
            arriveAt: "2026-10-27T18:00:00.000Z",
            arriveLocation: "Vancouver",
            duration: "3 hours",
            status: "Delayed",
            class: "Economy",
            sortOrder: 1,
            createdAt: createdAt.toISOString(),
            updatedAt: expect.any(String),
          },
        })
      })
    })
  })
})
