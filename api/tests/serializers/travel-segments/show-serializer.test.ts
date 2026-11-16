import ShowSerializer from "@/serializers/travel-segments/show-serializer"

import { travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/serializers/travel-segments/show-serializer.ts", () => {
  describe("ShowSerializer", () => {
    describe("#perform", () => {
      test("when serializing a leg, it exposes persisted itinerary endpoints", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelSegment = await travelSegmentFactory.create()

        // Act
        const result = ShowSerializer.perform(travelSegment, currentUser)

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
