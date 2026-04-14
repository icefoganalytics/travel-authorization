import { faker } from "@faker-js/faker"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"
import { TravelDeskFlightRequest } from "@/models"
import { PrefillFlightRequestsService } from "@/services/travel-desk-travel-requests"

describe("api/src/services/travel-desk-travel-requests/prefill-flight-requests-service.ts", () => {
  describe("PrefillFlightRequestsService", () => {
    describe(".perform", () => {
      test("when all necessary params are provided, it generates some flight requests", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const departureLocation1 = await locationFactory.create()
        const arrivalLocation1 = await locationFactory.create()
        const travelSegment1 = await travelSegmentFactory
          .transient({
            include: ["departureLocation", "arrivalLocation"],
          })
          .create({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: departureLocation1.id,
            arrivalLocationId: arrivalLocation1.id,
            departureOn: faker.date.soon(),
            departureTime: "11:00",
          })
        const departureLocation2 = await locationFactory.create()
        const arrivalLocation2 = await locationFactory.create()
        const travelSegment2 = await travelSegmentFactory
          .transient({
            include: ["departureLocation", "arrivalLocation"],
          })
          .create({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: departureLocation2.id,
            arrivalLocationId: arrivalLocation2.id,
            departureOn: faker.date.soon(),
            departureTime: "12:00",
          })
        const departureLocation3 = await locationFactory.create()
        const arrivalLocation3 = await locationFactory.create()
        const travelSegment3 = await travelSegmentFactory
          .transient({
            include: ["departureLocation", "arrivalLocation"],
          })
          .create({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: departureLocation3.id,
            arrivalLocationId: arrivalLocation3.id,
            departureOn: faker.date.soon(),
            departureTime: "00:00",
          })
        const currentUser = await userFactory.create()

        // Act
        const travelDeskFlightRequests = await PrefillFlightRequestsService.perform(
          travelDeskTravelRequest,
          [travelSegment1, travelSegment2, travelSegment3],
          currentUser
        )

        // Assert
        expect(travelDeskFlightRequests).toEqual([
          expect.objectContaining({
            departLocation: `${departureLocation1.city} (${departureLocation1.province})`,
            arriveLocation: `${arrivalLocation1.city} (${arrivalLocation1.province})`,
            datePreference: travelSegment1.departureOn,
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
          }),
          expect.objectContaining({
            departLocation: `${departureLocation2.city} (${departureLocation2.province})`,
            arriveLocation: `${arrivalLocation2.city} (${arrivalLocation2.province})`,
            datePreference: travelSegment2.departureOn,
            timePreference: TravelDeskFlightRequest.TimePreferences.PM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
          }),
          expect.objectContaining({
            departLocation: `${departureLocation3.city} (${departureLocation3.province})`,
            arriveLocation: `${arrivalLocation3.city} (${arrivalLocation3.province})`,
            datePreference: travelSegment3.departureOn,
            timePreference: TravelDeskFlightRequest.TimePreferences.AM,
            seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
          }),
        ])
      })

      test("when travel segments is empty, it errors informatively", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const currentUser = await userFactory.create()

        // Assert
        await expect(
          // Act
          PrefillFlightRequestsService.perform(travelDeskTravelRequest, [], currentUser)
        ).rejects.toThrowError(
          "Travel segments must have at least one element to prefill flight requests."
        )
      })

      test("when a travel segment is missing a departure location, it errors informatively", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const arrivalLocation = await locationFactory.create()
        const travelSegment = await travelSegmentFactory
          .transient({
            include: ["departureLocation", "arrivalLocation"],
          })
          .create({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: null,
            arrivalLocationId: arrivalLocation.id,
          })
        const currentUser = await userFactory.create()

        // Assert
        await expect(
          // Act
          PrefillFlightRequestsService.perform(
            travelDeskTravelRequest,
            [travelSegment],
            currentUser
          )
        ).rejects.toThrowError(
          `Departure location not found for travel segment: ${travelSegment.id}`
        )
      })

      test("when a travel segment is missing an arrival location, it errors informatively", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const departureLocation = await locationFactory.create()
        const travelSegment = await travelSegmentFactory
          .transient({
            include: ["departureLocation", "arrivalLocation"],
          })
          .create({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: departureLocation.id,
            arrivalLocationId: null,
          })
        const currentUser = await userFactory.create()

        // Assert
        await expect(
          // Act
          PrefillFlightRequestsService.perform(
            travelDeskTravelRequest,
            [travelSegment],
            currentUser
          )
        ).rejects.toThrowError(`Arrival location not found for travel segment: ${travelSegment.id}`)
      })

      test("when a travel segment is missing a departure date, it errors informatively", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
        })
        const departureLocation = await locationFactory.create()
        const arrivalLocation = await locationFactory.create()
        const travelSegment = await travelSegmentFactory
          .transient({
            include: ["departureLocation", "arrivalLocation"],
          })
          .create({
            travelAuthorizationId: travelAuthorization.id,
            departureLocationId: departureLocation.id,
            arrivalLocationId: arrivalLocation.id,
            departureOn: null,
          })
        const currentUser = await userFactory.create()

        // Assert
        await expect(
          // Act
          PrefillFlightRequestsService.perform(
            travelDeskTravelRequest,
            [travelSegment],
            currentUser
          )
        ).rejects.toThrowError(`Departure date not found for travel segment: ${travelSegment.id}`)
      })
    })
  })
})
