import { TravelAuthorization, User } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-segments-policy.ts", () => {
  describe("TravelSegmentsPolicy", () => {
    describe("#update", () => {
      test("when the traveller corrects a returned actual segment, it allows only the marker", () => {
        // Arrange
        const currentUser = userFactory.build({ id: 1 })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = travelSegmentFactory
          .associations({ travelAuthorization })
          .build({ isActual: true })
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)

        // Act
        const attributes = policy.permitAttributesForUpdate({
          isPrimaryDestination: true,
          arrivalLocationId: 99,
          departureOn: "2020-01-01",
          isActual: false,
          travelAuthorizationId: 99,
        })

        // Assert
        expect(attributes).toEqual({
          isPrimaryDestination: true,
        })
      })

      test("when another traveller attempts the correction, it denies the update", () => {
        // Arrange
        const currentUser = userFactory.build({
          id: 1,
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: 2,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = travelSegmentFactory
          .associations({ travelAuthorization })
          .build({ isActual: true })
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)

        // Act
        const result = policy.update()

        // Assert
        expect(result).toEqual(false)
      })

      test("when the traveller targets an estimated segment on a returned claim, it denies the update", () => {
        // Arrange
        const currentUser = userFactory.build({ id: 1 })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = travelSegmentFactory
          .associations({ travelAuthorization })
          .build({ isActual: false })
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)

        // Act
        const result = policy.update()

        // Assert
        expect(result).toEqual(false)
      })
    })

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
