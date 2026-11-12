import { TravelAuthorization, TravelSegment } from "@/models"

import { locationFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

import { BulkReplaceService } from "@/services/travel-segments/bulk-replace-service"

describe("api/src/services/travel-segments/bulk-replace-service.ts", () => {
  describe("BulkReplaceService", () => {
    describe("#perform", () => {
      test("when round-trip flags are omitted, it applies only the ordinary destination", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
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
        const selectedSegmentNumbers = travelSegments
          .filter(({ isPrimaryDestination }) => isPrimaryDestination)
          .map(({ segmentNumber }) => segmentNumber)

        // Assert
        expect(selectedSegmentNumbers).toEqual([1])
      })

      test("when one-way flags are omitted, it applies only the ordinary destination", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
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
        const selectedSegmentNumbers = travelSegments
          .filter(({ isPrimaryDestination }) => isPrimaryDestination)
          .map(({ segmentNumber }) => segmentNumber)

        // Assert
        expect(selectedSegmentNumbers).toEqual([3])
      })

      test("when multi-city flags are omitted, it applies only the ordinary destination", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
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
        const selectedSegmentNumbers = travelSegments
          .filter(({ isPrimaryDestination }) => isPrimaryDestination)
          .map(({ segmentNumber }) => segmentNumber)

        // Assert
        expect(selectedSegmentNumbers).toEqual([])
      })

      test("when an unchanged selected arrival is reordered without its flag, it preserves the saved selection", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedTravelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ segmentNumber: 1, isActual: false, isPrimaryDestination: true })
        const attributes = [
          {
            id: selectedTravelSegment.id,
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            arrivalLocationId: selectedTravelSegment.arrivalLocationId,
            segmentNumber: 9,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
        ]

        // Act
        const travelSegments = await BulkReplaceService.perform(
          travelAuthorization.id,
          attributes,
          false
        )

        // Assert
        expect(travelSegments[0].isPrimaryDestination).toEqual(true)
      })

      test("when a selected arrival changes without its flag, it clears the saved selection", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedTravelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ segmentNumber: 1, isActual: false, isPrimaryDestination: true })
        const replacementArrival = await locationFactory.create()
        const attributes = [
          {
            id: selectedTravelSegment.id,
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            arrivalLocationId: replacementArrival.id,
            segmentNumber: 9,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
        ]

        // Act
        const travelSegments = await BulkReplaceService.perform(
          travelAuthorization.id,
          attributes,
          false
        )

        // Assert
        expect(travelSegments[0].isPrimaryDestination).toEqual(false)
      })

      test("when an explicit false clears the selected arrival, it clears the saved selection", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedTravelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ segmentNumber: 1, isActual: false, isPrimaryDestination: true })
        const attributes = [
          {
            id: selectedTravelSegment.id,
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            arrivalLocationId: selectedTravelSegment.arrivalLocationId,
            segmentNumber: 9,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            isPrimaryDestination: false,
          },
        ]

        // Act
        const travelSegments = await BulkReplaceService.perform(
          travelAuthorization.id,
          attributes,
          false
        )

        // Assert
        expect(travelSegments[0].isPrimaryDestination).toEqual(false)
      })

      test("when an actual segment identity is supplied for estimate replacement, it rejects the replacement", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const actualTravelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true, isPrimaryDestination: true })
        const attributes = [
          {
            id: actualTravelSegment.id,
            travelAuthorizationId: travelAuthorization.id,
            isActual: false,
            arrivalLocationId: actualTravelSegment.arrivalLocationId,
            segmentNumber: 1,
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
          },
        ]

        // Act
        const result = BulkReplaceService.perform(travelAuthorization.id, attributes, false)

        // Assert
        await expect(result).rejects.toThrow(
          "Replacement segment IDs must belong to the itinerary being replaced."
        )
      })

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
