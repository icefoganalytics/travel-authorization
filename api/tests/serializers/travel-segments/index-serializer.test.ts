import IndexSerializer from "@/serializers/travel-segments/index-serializer"

import { travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/serializers/travel-segments/index-serializer.ts", () => {
  describe("IndexSerializer", () => {
    describe("#perform", () => {
      test("when a leg is not selected, it exposes a false marker", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: false })

        // Act
        const result = IndexSerializer.perform(travelSegment, currentUser)

        // Assert
        expect(result.isPrimaryDestination).toEqual(false)
      })

      test("when a leg is the primary destination, it exposes the persisted marker", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })

        // Act
        const result = IndexSerializer.perform(travelSegment, currentUser)

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
