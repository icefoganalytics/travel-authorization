import { TravelAuthorization } from "@/models"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

import ShowSerializer from "@/serializers/travel-authorizations/show-serializer"

describe("api/src/serializers/travel-authorizations/show-serializer.ts", () => {
  describe("ShowSerializer", () => {
    describe("#perform", () => {
      test("when estimated multi-city travel returns home, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: true,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: whitehorse.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: whitehorse.id,
          isPrimaryDestination: false,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: null,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when estimated multi-city travel ends away from home, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: true,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: false,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: null,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Ottawa" }))
      })

      test("when actual multi-city travel returns home with a one-way estimate, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: whitehorse.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: true,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: whitehorse.id,
          isPrimaryDestination: false,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Vancouver" }))
      })

      test("when actual multi-city travel ends away from home with a round-trip estimate, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: true,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Ottawa" }))
      })

      test("when estimated round-trip travel ends away from home, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: false,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
            tripTypeActual: null,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Vancouver" }))
      })

      test("when actual round-trip travel has a multi-city estimate, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: ottawa.id,
          isPrimaryDestination: false,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.ROUND_TRIP,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when one-way travel returns to its original departure, it returns the persisted destination", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })
        const estimatedTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const estimatedTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: whitehorse.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: true,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: true,
          departureLocationId: toronto.id,
          arrivalLocationId: vancouver.id,
          isPrimaryDestination: false,
        })
        const actualTravelSegment3 = travelSegmentFactory.build({
          segmentNumber: 3,
          isActual: true,
          departureLocationId: vancouver.id,
          arrivalLocationId: whitehorse.id,
          isPrimaryDestination: false,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
            tripTypeActual: null,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Whitehorse" }))
      })

      test("when a legacy round trip has one segment, it returns the ordinary arrival", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const travelSegment = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          tripTypeActual: null,
          travelSegments: [travelSegment],
        })
        const loadedTravelAuthorization = await TravelAuthorization.withScope("asShow").findByPk(
          travelAuthorization.id,
          { rejectOnEmpty: true }
        )

        // Act
        const result = ShowSerializer.perform(loadedTravelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when multi-city travel returns home across a gap, it returns only the selected arrival", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const travelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
          isPrimaryDestination: true,
        })
        const travelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: vancouver.id,
          arrivalLocationId: whitehorse.id,
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
          travelSegments: [travelSegment2, travelSegment1],
        })
        const loadedTravelAuthorization = await TravelAuthorization.withScope("asShow").findByPk(
          travelAuthorization.id,
          { rejectOnEmpty: true }
        )

        // Act
        const result = ShowSerializer.perform(loadedTravelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when the selected actual itinerary is empty, it returns no final destination", async () => {
        // Arrange
        const estimatedTravelSegment = travelSegmentFactory.build({ isActual: false })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
            "travelDeskTravelRequest",
            {
              association: "travelSegments",
              include: ["departureLocation", "arrivalLocation"],
            },
            "user",
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegments: [estimatedTravelSegment],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(null)
      })

      test("when the origin and last arrival are missing, it does not treat them as a return home", async () => {
        // Arrange
        const toronto = await locationFactory.create({ city: "Toronto" })
        const travelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: null,
          arrivalLocationId: toronto.id,
        })
        const travelSegment2 = travelSegmentFactory.build({
          segmentNumber: 2,
          isActual: false,
          departureLocationId: toronto.id,
          arrivalLocationId: null,
        })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: null,
            travelSegments: [travelSegment2, travelSegment1],
          })

        // Act
        const result = ShowSerializer.perform(travelAuthorization)

        // Assert
        expect(result.finalDestination).toEqual(null)
      })

      test("when the final destination location is not preloaded, it rejects the incomplete association graph", async () => {
        // Arrange
        const travelSegment = travelSegmentFactory.build({ isActual: false })
        const travelAuthorization = await travelAuthorizationFactory
          .include([
            "expenses",
            "purpose",
            "stops",
            "travelDeskTravelRequest",
            "travelSegments",
            "user",
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
            tripTypeActual: null,
            travelSegments: [travelSegment],
          })

        // Act & Assert
        expect(() => ShowSerializer.perform(travelAuthorization)).toThrow(
          "Expected travel segment locations to be pre-loaded."
        )
      })
    })
  })
})
