import { faker } from "@faker-js/faker"

import { TravelAuthorization, TravelSegment } from "@/models"
import IndexSerializer from "@/serializers/travel-authorizations/index-serializer"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/serializers/travel-authorizations/index-serializer.ts", () => {
  describe("IndexSerializer", () => {
    describe("#perform", () => {
      test("when travel authorization is pending approval, and travelling is complete the travel action is blank", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: faker.date.past(),
        })
        await travelAuthorization.reload({
          include: [
            "expenses",
            "purpose",
            { association: "stops", include: ["location"] },
            "travelDeskTravelRequest",
            { association: "travelSegments", include: ["departureLocation", "arrivalLocation"] },
            "user",
          ],
        })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            phase: "travel_approval",
            action: [],
          })
        )
      })

      test("when travel authorization is approved, and travelling is complete, the travel action includes submit_expense_claim", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.APPROVED,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: faker.date.past(),
          modeOfTransport: TravelSegment.TravelMethods.POOL_VEHICLE,
        })
        await travelAuthorization.reload({
          include: [
            "expenses",
            "purpose",
            { association: "stops", include: ["location"] },
            "travelDeskTravelRequest",
            { association: "travelSegments", include: ["departureLocation", "arrivalLocation"] },
            "user",
          ],
        })

        // Act
        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            phase: "travel_complete",
            action: ["submit_expense_claim"],
          })
        )
      })
    })
  })
})
