import ShowSerializer from "@/serializers/travel-segments/show-serializer"

import { travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/serializers/travel-segments/show-serializer.ts", () => {
  describe("ShowSerializer", () => {
    describe("#perform", () => {
      test("when a leg is the primary destination, it exposes the persisted marker", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })

        // Act
        const result = ShowSerializer.perform(travelSegment, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            id: travelSegment.id,
            arrivalLocationId: travelSegment.arrivalLocationId,
            isPrimaryDestination: true,
          })
        )
      })
    })
  })
})
