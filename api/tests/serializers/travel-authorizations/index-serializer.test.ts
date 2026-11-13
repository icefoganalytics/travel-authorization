import { faker } from "@faker-js/faker"

import { TravelAuthorization, TravelSegment } from "@/models"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

import IndexSerializer from "@/serializers/travel-authorizations/index-serializer"

describe("api/src/serializers/travel-authorizations/index-serializer.ts", () => {
  describe("IndexSerializer", () => {
    describe("#perform", () => {
      test("when estimated multi-city travel returns home, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when estimated multi-city travel ends away from home, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: ottawa.id,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Ottawa" }))
      })

      test("when actual multi-city travel returns home with different estimated destinations, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Ottawa" }))
      })

      test("when actual multi-city travel ends away from home, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: ottawa.id,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when round-trip travel returns home, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          tripTypeActual: null,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when one-way travel ends at its original departure, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: null,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: whitehorse.id,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Whitehorse" }))
      })

      test("when multi-city travel has missing departure and final arrival locations, it returns the selected itinerary's final destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
        })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        await travelSegmentFactory.associations({ travelAuthorization }).createMany([
          {
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: null,
          },
          {
            segmentNumber: 1,
            isActual: false,
            departureLocationId: null,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          },
          {
            segmentNumber: 3,
            isActual: true,
            departureLocationId: ottawa.id,
            arrivalLocationId: null,
          },
          {
            segmentNumber: 1,
            isActual: true,
            departureLocationId: null,
            arrivalLocationId: vancouver.id,
          },
          {
            segmentNumber: 2,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: ottawa.id,
          },
        ])

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
        expect(result.finalDestination).toEqual(null)
      })

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
