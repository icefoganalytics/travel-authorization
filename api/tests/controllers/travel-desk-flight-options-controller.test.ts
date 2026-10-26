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

describe("api/src/controllers/travel-desk-flight-options-controller.ts", () => {
  describe("TravelDeskFlightOptionsController", () => {
    describe("index", () => {
      test("when an option has flight segments, it returns the explicit nested flight fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
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
        const optionCreatedAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightOption = await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest.id,
          travelerId: adminUser.id,
          cost: "700.00",
          leg: "Whitehorse -> Vancouver",
          duration: "2 hours",
          flightPreferenceOrder: 1,
          additionalInformation: null,
          createdAt: optionCreatedAt,
        })
        const segmentCreatedAt = new Date("2026-10-03T12:00:00.000Z")
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
          .get("/api/travel-desk-flight-options")
          .query(qs.stringify({ where: { id: travelDeskFlightOption.id } }))

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightOptions: [
            {
              id: travelDeskFlightOption.id,
              flightRequestId: travelDeskFlightRequest.id,
              travelerId: adminUser.id,
              cost: "700.00",
              leg: "Whitehorse -> Vancouver",
              duration: "2 hours",
              flightPreferenceOrder: 1,
              additionalInformation: null,
              createdAt: optionCreatedAt.toISOString(),
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
          totalCount: 1,
        })
      })
    })

    describe("show", () => {
      test("when the option belongs to the current administrator, it returns the explicit option fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
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
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightOption = await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest.id,
          travelerId: adminUser.id,
          cost: "700.00",
          leg: "Whitehorse -> Vancouver",
          duration: "2 hours",
          flightPreferenceOrder: 1,
          additionalInformation: null,
          createdAt,
        })

        // Act
        const response = await request().get(
          `/api/travel-desk-flight-options/${travelDeskFlightOption.id}`
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightOption: {
            id: travelDeskFlightOption.id,
            flightRequestId: travelDeskFlightRequest.id,
            travelerId: adminUser.id,
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
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

      test("when an option belongs to another traveller, it rejects the request", async () => {
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
        const travelDeskFlightOption = await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest.id,
          travelerId: traveler.id,
          cost: "700.00",
          leg: "Whitehorse -> Vancouver",
          duration: "2 hours",
          flightPreferenceOrder: 1,
          additionalInformation: null,
        })

        // Act
        const response = await request().get(
          `/api/travel-desk-flight-options/${travelDeskFlightOption.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to view this travel desk flight option.",
        })
      })

      test("when the flight option does not exist, it returns not found", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)

        // Act
        const response = await request().get("/api/travel-desk-flight-options/0")

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk flight option not found.",
        })
      })
    })

    describe("create", () => {
      test("when option and segment attributes are permitted, it returns the created option fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
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
        const response = await request()
          .post("/api/travel-desk-flight-options")
          .send({
            flightRequestId: travelDeskFlightRequest.id,
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: null,
            flightSegmentsAttributes: [
              {
                flightNumber: "YT101",
                departAt: "2026-10-27T15:00:00.000Z",
                departLocation: "Whitehorse",
                arriveAt: "2026-10-27T18:00:00.000Z",
                arriveLocation: "Vancouver",
                duration: "3 hours",
                status: "Confirmed",
                class: "Economy",
                sortOrder: 2,
              },
            ],
          })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskFlightOption: {
            id: expect.any(Number),
            flightRequestId: travelDeskFlightRequest.id,
            travelerId: adminUser.id,
            cost: "700.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: null,
            additionalInformation: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })
      })
    })

    describe("update", () => {
      test("when the option is updated, it returns its explicit mutable fields", async () => {
        // Arrange
        const adminUser = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(adminUser)
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: adminUser })
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
        const createdAt = new Date("2026-10-01T12:00:00.000Z")
        const travelDeskFlightOption = await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest.id,
          travelerId: adminUser.id,
          cost: "700.00",
          leg: "Whitehorse -> Vancouver",
          duration: "2 hours",
          flightPreferenceOrder: 1,
          additionalInformation: null,
          createdAt,
        })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-flight-options/${travelDeskFlightOption.id}`)
          .send({ cost: "900.00" })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskFlightOption: {
            id: travelDeskFlightOption.id,
            flightRequestId: travelDeskFlightRequest.id,
            travelerId: adminUser.id,
            cost: "900.00",
            leg: "Whitehorse -> Vancouver",
            duration: "2 hours",
            flightPreferenceOrder: 1,
            additionalInformation: null,
            createdAt: createdAt.toISOString(),
            updatedAt: expect.any(String),
          },
        })
      })
    })
  })
})
