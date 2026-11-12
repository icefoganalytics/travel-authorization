import { faker } from "@faker-js/faker"

import { TravelAuthorization, TravelSegment } from "@/models"
import IndexSerializer from "@/serializers/travel-authorizations/index-serializer"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/serializers/travel-authorizations/index-serializer.ts", () => {
  describe("IndexSerializer", () => {
    describe("#perform", () => {
      test.each([
        {
          condition: "estimated multi-city travel returns home",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
          returnsHome: true,
          missingEndpoints: false,
          expectedDestination: expect.objectContaining({ city: "Toronto" }),
        },
        {
          condition: "estimated multi-city travel ends away from home",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
          returnsHome: false,
          missingEndpoints: false,
          expectedDestination: expect.objectContaining({ city: "Ottawa" }),
        },
        {
          condition: "actual multi-city travel returns home with different estimated destinations",
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          returnsHome: true,
          missingEndpoints: false,
          expectedDestination: expect.objectContaining({ city: "Ottawa" }),
        },
        {
          condition: "actual multi-city travel ends away from home",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          returnsHome: false,
          missingEndpoints: false,
          expectedDestination: expect.objectContaining({ city: "Toronto" }),
        },
        {
          condition: "round-trip travel returns home",
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          tripTypeActual: null,
          returnsHome: true,
          missingEndpoints: false,
          expectedDestination: expect.objectContaining({ city: "Toronto" }),
        },
        {
          condition: "one-way travel ends at its original departure",
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: null,
          returnsHome: true,
          missingEndpoints: false,
          expectedDestination: expect.objectContaining({ city: "Whitehorse" }),
        },
        {
          condition: "multi-city travel has missing departure and final arrival locations",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
          returnsHome: true,
          missingEndpoints: true,
          expectedDestination: null,
        },
      ])(
        "when $condition, it returns the selected itinerary's final destination",
        async ({
          tripTypeEstimate,
          tripTypeActual,
          returnsHome,
          missingEndpoints,
          expectedDestination,
        }) => {
          // Arrange
          const currentUser = await userFactory.create()
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate,
            tripTypeActual,
          })
          const whitehorse = await locationFactory.create({ city: "Whitehorse" })
          const vancouver = await locationFactory.create({ city: "Vancouver" })
          const toronto = await locationFactory.create({ city: "Toronto" })
          const ottawa = await locationFactory.create({ city: "Ottawa" })

          for (const isActual of [false, true]) {
            const destination = isActual ? ottawa : toronto
            const openDestination = isActual ? toronto : ottawa
            const departureLocationId = missingEndpoints ? null : whitehorse.id
            let arrivalLocationId: number | null = returnsHome ? whitehorse.id : openDestination.id
            if (missingEndpoints) {
              arrivalLocationId = null
            }

            // Create out of order; the index query orders each phase by segment number.
            await travelSegmentFactory.associations({ travelAuthorization }).create({
              segmentNumber: 3,
              isActual,
              departureLocationId: destination.id,
              arrivalLocationId,
            })
            await travelSegmentFactory.associations({ travelAuthorization }).create({
              segmentNumber: 1,
              isActual,
              departureLocationId,
              arrivalLocationId: vancouver.id,
            })
            await travelSegmentFactory.associations({ travelAuthorization }).create({
              segmentNumber: 2,
              isActual,
              departureLocationId: vancouver.id,
              arrivalLocationId: destination.id,
            })
          }

          await travelAuthorization.reload({
            include: [
              "expenses",
              "purpose",
              {
                association: "stops",
                include: ["location"],
              },
              "travelDeskTravelRequest",
              {
                association: "travelSegments",
                separate: true,
                order: [
                  ["segmentNumber", "ASC"],
                  ["id", "ASC"],
                ],
                include: ["departureLocation", "arrivalLocation"],
              },
              "user",
            ],
          })

          // Act
          const result = IndexSerializer.perform(travelAuthorization, currentUser)

          // Assert
          expect(result.finalDestination).toEqual(expectedDestination)
        }
      )

      test("when the selected itinerary is empty, it returns no final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual: false,
        })
        await travelAuthorization.reload({
          include: [
            "expenses",
            "purpose",
            {
              association: "stops",
              include: ["location"],
            },
            "travelDeskTravelRequest",
            {
              association: "travelSegments",
              include: ["departureLocation", "arrivalLocation"],
            },
            "user",
          ],
        })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(null)
      })

      test("when travel authorization is pending approval and travelling is complete, it returns no travel action", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          departureOn: faker.date.past(),
        })
        await travelAuthorization.reload({
          include: [
            "expenses",
            "purpose",
            {
              association: "stops",
              include: ["location"],
            },
            "travelDeskTravelRequest",
            {
              association: "travelSegments",
              include: ["departureLocation", "arrivalLocation"],
            },
            "user",
          ],
        })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            phase: "travel_approval",
            action: [],
          })
        )
      })

      test("when travel authorization is approved and travelling is complete, it includes submit_expense_claim", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          departureOn: faker.date.past(),
          modeOfTransport: TravelSegment.TravelMethods.POOL_VEHICLE,
        })
        await travelAuthorization.reload({
          include: [
            "expenses",
            "purpose",
            {
              association: "stops",
              include: ["location"],
            },
            "travelDeskTravelRequest",
            {
              association: "travelSegments",
              include: ["departureLocation", "arrivalLocation"],
            },
            "user",
          ],
        })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            phase: "travel_complete",
            action: ["submit_expense_claim"],
          })
        )
      })
    })
  })
})
