import { TravelAuthorization, TravelSegment } from "@/models"
import DestroyService from "@/services/travel-segments/destroy-service"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/services/travel-segments/destroy-service.ts", () => {
  describe("DestroyService", () => {
    describe("#perform", () => {
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
