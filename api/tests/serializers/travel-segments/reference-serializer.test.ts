import ReferenceSerializer from "@/serializers/travel-segments/reference-serializer"

import { travelSegmentFactory } from "@/factories"

describe("api/src/serializers/travel-segments/reference-serializer.ts", () => {
  describe("ReferenceSerializer", () => {
    describe("#perform", () => {
      test("when a leg is the primary destination, it exposes the persisted marker", async () => {
        // Arrange
        const travelSegment = await travelSegmentFactory.create({ isPrimaryDestination: true })

        // Act
        const result = ReferenceSerializer.perform(travelSegment)

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
