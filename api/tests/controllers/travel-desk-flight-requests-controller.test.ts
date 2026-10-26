import qs from "qs"

import {
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  User,
} from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-flight-requests-controller.ts", () => {
  describe("TravelDeskFlightRequestsController", () => {
    describe("index", () => {
      test("when flight requests have options, it returns the explicit nested flight response", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightRequest = await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-10-27",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          createdAt,
        })
        const flightOptionCreatedAt = new Date("2026-10-03T12:00:00.000Z")
        const travelDeskFlightOption = await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest.id,
          travelerId: adminUser.id,
          cost: "700.00",
          leg: "Whitehorse -> Vancouver",
          duration: "2 hours",
          flightPreferenceOrder: 1,
          additionalInformation: null,
          createdAt: flightOptionCreatedAt,
        })
        const segmentCreatedAt = new Date("2026-10-05T12:00:00.000Z")
        await TravelDeskFlightSegment.create({
          flightOptionId: travelDeskFlightOption.id,
          flightNumber: "YT101",
          departAt: new Date("2026-10-27T15:00:00.000Z"),
          departLocation: "Whitehorse",
          arriveAt: new Date("2026-10-27T18:00:00.000Z"),
          arriveLocation: "Vancouver",
          duration: "3 hours",
          status: "Confirmed",
          class: "Economy",
          sortOrder: 2,
          createdAt: segmentCreatedAt,
        })

        // Act
        const response = await request()
          .get("/api/travel-desk-flight-requests")
          .query(qs.stringify({ where: { id: travelDeskFlightRequest.id } }))

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightRequests: [
            {
              id: travelDeskFlightRequest.id,
              travelRequestId: travelDeskTravelRequest.id,
              departLocation: "Whitehorse",
              arriveLocation: "Vancouver",
              datePreference: "2026-10-27",
              timePreference: "AM",
              seatPreference: "Window",
              createdAt: createdAt.toISOString(),
              updatedAt: expect.any(String),
              flightOptions: [
                {
                  id: travelDeskFlightOption.id,
                  flightRequestId: travelDeskFlightRequest.id,
                  travelerId: adminUser.id,
                  cost: "700.00",
                  leg: "Whitehorse -> Vancouver",
                  duration: "2 hours",
                  flightPreferenceOrder: 1,
                  additionalInformation: null,
                  createdAt: flightOptionCreatedAt.toISOString(),
                  updatedAt: expect.any(String),
                  flightSegments: [
                    {
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
                      createdAt: segmentCreatedAt.toISOString(),
                      updatedAt: expect.any(String),
                    },
                  ],
                },
              ],
            },
          ],
          totalCount: 1,
        })
      })
    })

    describe("show", () => {
      test("when the request is visible, it returns flight fields without the policy association graph", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightRequest = await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-10-27",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          createdAt,
        })

        // Act
        const response = await request().get(
          `/api/travel-desk-flight-requests/${travelDeskFlightRequest.id}`
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightRequest: {
            id: travelDeskFlightRequest.id,
            travelRequestId: travelDeskTravelRequest.id,
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: "AM",
            seatPreference: "Window",
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

      test("when another traveller requests a flight request, it rejects the request", async () => {
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
        const travelDeskFlightRequest = await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-10-27",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
        })

        // Act
        const response = await request().get(
          `/api/travel-desk-flight-requests/${travelDeskFlightRequest.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to view this flight request.",
        })
      })

      test("when the flight request does not exist, it returns not found", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)

        // Act
        const response = await request().get("/api/travel-desk-flight-requests/0")

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Flight request not found.",
        })
      })
    })

    describe("create", () => {
      test("when flight request attributes are permitted, it returns only the created request fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()

        // Act
        const response = await request().post("/api/travel-desk-flight-requests").send({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-10-27",
          timePreference: "AM",
          seatPreference: "Window",
        })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskFlightRequest: {
            id: expect.any(Number),
            travelRequestId: travelDeskTravelRequest.id,
            departLocation: "Whitehorse",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: "AM",
            seatPreference: "Window",
            createdAt: expect.any(String),
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
    })

    describe("update", () => {
      test("when the request is updated, it returns the updated flight fields without its associations", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create()
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightRequest = await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-10-27",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.WINDOW,
          createdAt,
        })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-flight-requests/${travelDeskFlightRequest.id}`)
          .send({ departLocation: "Dawson City" })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightRequest: {
            id: travelDeskFlightRequest.id,
            travelRequestId: travelDeskTravelRequest.id,
            departLocation: "Dawson City",
            arriveLocation: "Vancouver",
            datePreference: "2026-10-27",
            timePreference: "AM",
            seatPreference: "Window",
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
    })
  })
})
