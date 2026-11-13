import { TravelAuthorization } from "@/models"
import ShowSerializer from "@/serializers/travel-authorizations/show-serializer"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/serializers/travel-authorizations/show-serializer.ts", () => {
  describe("ShowSerializer", () => {
    describe("#perform", () => {
      test.each([
        {
          scenario: "estimated multi-city travel returns home",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
          returnsHome: true,
          expectedCity: "Toronto",
        },
        {
          scenario: "estimated multi-city travel ends away from home",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: null,
          returnsHome: false,
          expectedCity: "Ottawa",
        },
        {
          scenario: "actual multi-city travel returns home with a different estimated trip type",
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          returnsHome: true,
          expectedCity: "Vancouver",
        },
        {
          scenario: "actual multi-city travel ends away from home",
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          returnsHome: false,
          expectedCity: "Ottawa",
        },
        {
          scenario: "estimated round-trip travel ends away from home",
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          tripTypeActual: null,
          returnsHome: false,
          expectedCity: "Toronto",
        },
        {
          scenario: "actual round-trip travel ends away from home",
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.ROUND_TRIP,
          returnsHome: false,
          expectedCity: "Vancouver",
        },
        {
          scenario: "one-way travel returns to its original departure",
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeActual: null,
          returnsHome: true,
          expectedCity: "Whitehorse",
        },
      ])(
        "when $scenario, it returns $expectedCity from the persisted itinerary",
        async ({ tripTypeEstimate, tripTypeActual, returnsHome, expectedCity }) => {
          // Arrange
          const whitehorse = await locationFactory.create({ city: "Whitehorse" })
          const vancouver = await locationFactory.create({ city: "Vancouver" })
          const toronto = await locationFactory.create({ city: "Toronto" })
          const ottawa = await locationFactory.create({ city: "Ottawa" })
          let lastArrivalLocationId = ottawa.id
          if (returnsHome) {
            lastArrivalLocationId = whitehorse.id
          }

          const estimatedTravelSegment1 = travelSegmentFactory.build({
            segmentNumber: 1,
            isActual: false,
            departureLocationId: whitehorse.id,
            arrivalLocationId: vancouver.id,
          })
          const estimatedTravelSegment2 = travelSegmentFactory.build({
            segmentNumber: 2,
            isActual: false,
            departureLocationId: vancouver.id,
            arrivalLocationId: toronto.id,
          })
          const estimatedTravelSegment3 = travelSegmentFactory.build({
            segmentNumber: 3,
            isActual: false,
            departureLocationId: toronto.id,
            arrivalLocationId: lastArrivalLocationId,
          })
          const actualTravelSegment1 = travelSegmentFactory.build({
            segmentNumber: 1,
            isActual: true,
            departureLocationId: whitehorse.id,
            arrivalLocationId: toronto.id,
          })
          const actualTravelSegment2 = travelSegmentFactory.build({
            segmentNumber: 2,
            isActual: true,
            departureLocationId: toronto.id,
            arrivalLocationId: vancouver.id,
          })
          const actualTravelSegment3 = travelSegmentFactory.build({
            segmentNumber: 3,
            isActual: true,
            departureLocationId: vancouver.id,
            arrivalLocationId: lastArrivalLocationId,
          })
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate,
            tripTypeActual,
            travelSegments: [
              actualTravelSegment3,
              estimatedTravelSegment3,
              actualTravelSegment1,
              estimatedTravelSegment1,
              actualTravelSegment2,
              estimatedTravelSegment2,
            ],
          })
          // Exercise the same ordered association graph used by show, create, and update.
          const loadedTravelAuthorization = await TravelAuthorization.withScope("asShow").findByPk(
            travelAuthorization.id,
            { rejectOnEmpty: true }
          )

          // Act
          const result = ShowSerializer.perform(loadedTravelAuthorization)

          // Assert
          expect(result.finalDestination).toEqual(expect.objectContaining({ city: expectedCity }))
        }
      )

      test("when a legacy round trip has one segment, it returns the departure location", async () => {
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
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Whitehorse" }))
      })

      test("when multi-city travel returns home across a gap, it uses the penultimate arrival rather than the last departure", async () => {
        // Arrange
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const travelSegment1 = travelSegmentFactory.build({
          segmentNumber: 1,
          isActual: false,
          departureLocationId: whitehorse.id,
          arrivalLocationId: toronto.id,
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
            "travelSegments",
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
