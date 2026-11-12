import { TravelAuthorization, TravelSegment } from "@/models"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

import UpdateService from "@/services/travel-segments/update-service"

describe("api/src/services/travel-segments/update-service.ts", () => {
  describe("UpdateService", () => {
    describe("#perform", () => {
      test("when departure date changes, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { departureOn: "2026-11-01" }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when departure time changes, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { departureTime: "09:30" }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when segment is reordered, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { segmentNumber: 9 }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when accommodation changes, it preserves the saved selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isPrimaryDestination: true,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        const attributes = { accommodationType: TravelSegment.AccommodationTypes.HOTEL }

        // Act
        await UpdateService.perform(travelSegment, attributes, currentUser)
        await travelSegment.reload()

        // Assert
        expect(travelSegment.isPrimaryDestination).toEqual(true)
      })

      test("when the selected arrival changes without an explicit marker, it clears the choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })
        const arrivalLocation = await locationFactory.create()

        // Act
        await UpdateService.perform(
          travelSegment,
          { arrivalLocationId: arrivalLocation.id },
          currentUser
        )

        // Assert
        expect(await travelSegment.reload()).toEqual(
          expect.objectContaining({
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: false,
          })
        )
      })

      test("when a changed arrival is explicitly selected, it keeps the new choice", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })
        const arrivalLocation = await locationFactory.create()

        // Act
        await UpdateService.perform(
          travelSegment,
          {
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: true,
          },
          currentUser
        )

        // Assert
        expect(await travelSegment.reload()).toEqual(
          expect.objectContaining({
            arrivalLocationId: arrivalLocation.id,
            isPrimaryDestination: true,
          })
        )
      })

      test("when selecting a null arrival explicitly, it rejects the update", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create()

        // Act
        const result = UpdateService.perform(
          travelSegment,
          { arrivalLocationId: null, isPrimaryDestination: true },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow("Primary destination requires an arrival location.")
      })

      test("when another arrival is already selected, it preserves the persisted selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true })
        const otherSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create()

        // Act
        await UpdateService.perform(
          otherSegment,
          { isPrimaryDestination: true },
          currentUser
        ).catch(() => undefined)

        // Assert
        expect(await TravelSegment.findAll({ order: [["id", "ASC"]] })).toEqual([
          expect.objectContaining({ id: selectedSegment.id, isPrimaryDestination: true }),
          expect.objectContaining({ id: otherSegment.id, isPrimaryDestination: false }),
        ])
      })
    })
  })
})
