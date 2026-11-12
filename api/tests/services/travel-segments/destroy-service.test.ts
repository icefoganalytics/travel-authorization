import { TravelAuthorization, TravelSegment } from "@/models"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

import DestroyService from "@/services/travel-segments/destroy-service"

describe("api/src/services/travel-segments/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe("#perform", () => {
      test("when deleting a leg would leave only one multi-city leg, it rejects deletion", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedTravelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: false, isPrimaryDestination: true })
        await travelSegmentFactory.associations({ travelAuthorization }).create({ isActual: false })

        // Act
        const result = DestroyService.perform(selectedTravelSegment, currentUser)

        // Assert
        await expect(result).rejects.toThrow(
          "Travel segment cannot be deleted when trip type is multi-city and there are only two travel segments."
        )
      })

      test("when deleting a selected estimate, it clears that choice without changing actual selection", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const selectedEstimate = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: false, isPrimaryDestination: true })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .createList(2, { isActual: false })
        const selectedActual = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true, isPrimaryDestination: true })
        await travelSegmentFactory.associations({ travelAuthorization }).create({ isActual: true })
        await selectedEstimate.reload({ include: ["travelAuthorization"] })

        // Act
        await DestroyService.perform(selectedEstimate, currentUser)

        // Assert
        expect(await TravelSegment.findAll({ where: { isPrimaryDestination: true } })).toEqual([
          expect.objectContaining({ id: selectedActual.id, isActual: true }),
        ])
      })
    })
  })
})
