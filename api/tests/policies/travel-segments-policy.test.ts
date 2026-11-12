import { travelSegmentFactory, userFactory } from "@/factories"

import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

describe("api/src/policies/travel-segments-policy.ts", () => {
  describe("TravelSegmentsPolicy", () => {
    describe("#permittedAttributes", () => {
      test("when creating an individual segment, it does not permit a caller-selected identity", () => {
        // Arrange
        const currentUser = userFactory.build()
        const travelSegment = travelSegmentFactory.build()
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)

        // Act
        const attributes = policy.permittedAttributesForCreate()

        // Assert
        expect(attributes).not.toContain("id")
      })

      test("when replacing an itinerary, it permits persisted segment identities", () => {
        // Arrange
        const currentUser = userFactory.build()
        const travelSegment = travelSegmentFactory.build()
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)

        // Act
        const attributes = policy.permittedAttributesForBulkReplace()

        // Assert
        expect(attributes).toContain("id")
      })

      test("when mutating a travel segment, it permits an explicit primary destination flag", () => {
        // Arrange
        const currentUser = userFactory.build()
        const travelSegment = travelSegmentFactory.build()
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)

        // Act
        const attributes = policy.permittedAttributes()

        // Assert
        expect(attributes).toContain("isPrimaryDestination")
      })
    })
  })
})
