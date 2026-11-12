import { TravelAuthorization, TravelSegment } from "@/models"
import { BulkReplaceService } from "@/services/travel-segments/bulk-replace-service"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/services/travel-segments/bulk-replace-service.ts", () => {
  describe("BulkReplaceService", () => {
    describe("#perform", () => {
      test.each([
        {
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
          expectedSegments: [
            expect.objectContaining({ segmentNumber: 3, isPrimaryDestination: false }),
            expect.objectContaining({ segmentNumber: 1, isPrimaryDestination: true }),
            expect.objectContaining({ segmentNumber: 2, isPrimaryDestination: false }),
          ],
        },
        {
          tripType: TravelAuthorization.TripTypes.ONE_WAY,
          expectedSegments: [
            expect.objectContaining({ segmentNumber: 3, isPrimaryDestination: true }),
            expect.objectContaining({ segmentNumber: 1, isPrimaryDestination: false }),
            expect.objectContaining({ segmentNumber: 2, isPrimaryDestination: false }),
          ],
        },
        {
          tripType: TravelAuthorization.TripTypes.MULTI_CITY,
          expectedSegments: [
            expect.objectContaining({ segmentNumber: 3, isPrimaryDestination: false }),
            expect.objectContaining({ segmentNumber: 1, isPrimaryDestination: false }),
            expect.objectContaining({ segmentNumber: 2, isPrimaryDestination: false }),
          ],
        },
      ])(
        "when $tripType flags are omitted, it applies only a simple-trip default",
        async ({ tripType, expectedSegments }) => {
          // Arrange
          const travelAuthorization = await travelAuthorizationFactory.create({
            tripTypeEstimate: tripType,
          })
          const arrivalLocation = await locationFactory.create()
          const attributes = [3, 1, 2].map((segmentNumber) => ({
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            segmentNumber,
            arrivalLocationId: arrivalLocation.id,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          }))

          // Act
          const travelSegments = await BulkReplaceService.perform(
            travelAuthorization.id,
            attributes,
            false
          )

          // Assert
          expect(travelSegments).toEqual(expectedSegments)
        }
      )

      test("when simple-trip flags are explicitly false, it does not replace that choice", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
        })
        const arrivalLocation = await locationFactory.create()

        // Act
        const travelSegments = await BulkReplaceService.perform(
          travelAuthorization.id,
          [
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual: false,
              isPrimaryDestination: false,
              arrivalLocationId: arrivalLocation.id,
              segmentNumber: 1,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
          ],
          false
        )

        // Assert
        expect(travelSegments[0].isPrimaryDestination).toEqual(false)
      })

      test("when multiple arrivals are selected, it rejects the replacement", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const arrivalLocation = await locationFactory.create()
        const attributes = [1, 2].map((segmentNumber) => ({
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          isPrimaryDestination: true,
          arrivalLocationId: arrivalLocation.id,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        const result = BulkReplaceService.perform(travelAuthorization.id, attributes, false)

        // Assert
        await expect(result).rejects.toThrow(
          "Only one primary destination may be selected per itinerary."
        )
      })

      test("when duplicate selection is rejected, the old itinerary survives", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const originalSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true })
        const attributes = [1, 2].map((segmentNumber) => ({
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          isPrimaryDestination: true,
          arrivalLocationId: originalSegment.arrivalLocationId,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        await BulkReplaceService.perform(travelAuthorization.id, attributes, false).catch(
          () => undefined
        )

        // Assert
        expect(await TravelSegment.findAll()).toEqual([
          expect.objectContaining({ id: originalSegment.id, isPrimaryDestination: true }),
        ])
      })

      test("when a selected arrival is null, it rejects the replacement", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()

        // Act
        const result = BulkReplaceService.perform(
          travelAuthorization.id,
          [
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual: false,
              isPrimaryDestination: true,
              arrivalLocationId: null,
              segmentNumber: 1,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
          ],
          false
        )

        // Assert
        await expect(result).rejects.toThrow("Primary destination requires an arrival location.")
      })

      test("when actual selection changes, the estimated marker is preserved", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const estimate = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: false, isPrimaryDestination: true })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true, isPrimaryDestination: true })
        const arrivalLocation = await locationFactory.create()

        // Act
        await BulkReplaceService.perform(
          travelAuthorization.id,
          [
            {
              travelAuthorizationId: travelAuthorization.id,
              isActual: true,
              isPrimaryDestination: true,
              arrivalLocationId: arrivalLocation.id,
              segmentNumber: 1,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            },
          ],
          true
        )

        // Assert
        expect(await TravelSegment.findAll({ order: [["isActual", "ASC"]] })).toEqual([
          expect.objectContaining({ id: estimate.id, isActual: false, isPrimaryDestination: true }),
          expect.objectContaining({
            isActual: true,
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: true,
          }),
        ])
      })

      test("when replacement removes the marked leg, it does not infer a new multi-city choice", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true })
        const arrivalLocation = await locationFactory.create()
        const attributes = [1, 2].map((segmentNumber) => ({
          travelAuthorizationId: travelAuthorization.id,
          isActual: false,
          isPrimaryDestination: false,
          arrivalLocationId: arrivalLocation.id,
          segmentNumber,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        }))

        // Act
        await BulkReplaceService.perform(travelAuthorization.id, attributes, false)

        // Assert
        expect(await TravelSegment.count({ where: { isPrimaryDestination: true } })).toEqual(0)
      })
    })
  })
})
