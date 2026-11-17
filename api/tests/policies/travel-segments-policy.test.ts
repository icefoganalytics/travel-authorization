import { TravelAuthorization, User } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-segments-policy.ts", () => {
  describe("TravelSegmentsPolicy", () => {
    describe("#update", () => {
      test("when the traveller targets a returned actual segment, it denies route changes", () => {
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
        const result = policy.update()

        // Assert
        expect(result).toEqual(false)
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

    describe("#permitAttributesForCreate", () => {
      test("when creating an individual segment, it does not permit a caller-selected identity", () => {
        // Arrange
        const currentUser = userFactory.build()
        const travelSegment = travelSegmentFactory.build()
        const policy = new TravelSegmentsPolicy(currentUser, travelSegment)
        const createdAt = new Date("2026-01-01T00:00:00.000Z")
        const attributes = {
          id: 7,
          travelAuthorizationId: 1,
          isActual: false,
          arrivalLocationId: 2,
          createdAt,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForCreate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          travelAuthorizationId: 1,
          isActual: false,
          arrivalLocationId: 2,
        })
      })
    })
  })
})
