import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

import { travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-segments-policy.ts", () => {
  describe("TravelSegmentsPolicy", () => {
    describe("#permittedAttributes", () => {
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
