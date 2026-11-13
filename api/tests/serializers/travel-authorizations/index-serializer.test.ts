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
      test("when estimated multi-city travel returns home, it returns Toronto instead of Whitehorse", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: null,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: whitehorse.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: true,
                departureLocationId: ottawa.id,
                arrivalLocationId: whitehorse.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: true,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: true,
                departureLocationId: vancouver.id,
                arrivalLocationId: ottawa.id,
              }),
            ],
          })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when estimated multi-city travel ends away from home, it returns the last arrival", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: null,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: ottawa.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
            ],
          })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Ottawa" }))
      })

      test("when actual multi-city travel returns home, it ignores the different estimated destination", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: whitehorse.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: true,
                departureLocationId: ottawa.id,
                arrivalLocationId: whitehorse.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: true,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: true,
                departureLocationId: vancouver.id,
                arrivalLocationId: ottawa.id,
              }),
            ],
          })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Ottawa" }))
      })

      test("when actual multi-city travel ends away from home, it returns the last actual arrival", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })
        const ottawa = await locationFactory.create({ city: "Ottawa" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: ottawa.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: true,
                departureLocationId: ottawa.id,
                arrivalLocationId: toronto.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: true,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: true,
                departureLocationId: vancouver.id,
                arrivalLocationId: ottawa.id,
              }),
            ],
          })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when round-trip travel returns home, it returns the last departure", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
            tripTypeActual: null,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: whitehorse.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
            ],
          })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Toronto" }))
      })

      test("when one-way travel ends at its original departure, it still returns the last arrival", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const whitehorse = await locationFactory.create({ city: "Whitehorse" })
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
            tripTypeActual: null,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: whitehorse.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: whitehorse.id,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
            ],
          })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result.finalDestination).toEqual(expect.objectContaining({ city: "Whitehorse" }))
      })

      test("when the origin and last arrival are missing, it does not treat them as a return home", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const vancouver = await locationFactory.create({ city: "Vancouver" })
        const toronto = await locationFactory.create({ city: "Toronto" })

        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: null,
            travelSegments: [
              travelSegmentFactory.build({
                segmentNumber: 3,
                isActual: false,
                departureLocationId: toronto.id,
                arrivalLocationId: null,
              }),
              travelSegmentFactory.build({
                segmentNumber: 1,
                isActual: false,
                departureLocationId: null,
                arrivalLocationId: vancouver.id,
              }),
              travelSegmentFactory.build({
                segmentNumber: 2,
                isActual: false,
                departureLocationId: vancouver.id,
                arrivalLocationId: toronto.id,
              }),
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
        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
            travelSegments: [
              travelSegmentFactory.build({
                isActual: false,
              }),
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
        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            status: TravelAuthorization.Statuses.SUBMITTED,
            travelSegments: [
              travelSegmentFactory.build({
                departureOn: faker.date.past(),
              }),
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
        const travelAuthorization = await travelAuthorizationFactory
          .include([
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
          ])
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
            travelSegments: [
              travelSegmentFactory.build({
                departureOn: faker.date.past(),
                modeOfTransport: TravelSegment.TravelMethods.POOL_VEHICLE,
              }),
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
