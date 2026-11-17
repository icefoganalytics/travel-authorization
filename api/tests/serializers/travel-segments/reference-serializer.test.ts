import ReferenceSerializer from "@/serializers/travel-segments/reference-serializer"

import { travelSegmentFactory } from "@/factories"

describe("api/src/serializers/travel-segments/reference-serializer.ts", () => {
  describe("ReferenceSerializer", () => {
    describe("#perform", () => {
      test("when serializing a leg, it exposes persisted itinerary endpoints", async () => {
        // Arrange
        const travelSegment = await travelSegmentFactory.create()

        // Act
        const result = ReferenceSerializer.perform(travelSegment)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            id: travelSegment.id,
            arrivalLocationId: travelSegment.arrivalLocationId,
          })
        )
      })
    })
  })
})
