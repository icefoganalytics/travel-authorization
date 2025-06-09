import { faker } from "@faker-js/faker"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"
import { TravelAuthorization } from "@/models"
import { IndexSerializer } from "@/serializers/travel-authorizations"

describe("api/src/serializers/travel-authorizations/index-serializer.ts", () => {
  describe("IndexSerializer", () => {
    describe("#perform", () => {
      test("when travel authorization is pending approval, and travelling is complete the travel action is blank", async () => {
        const currentUser = await userFactory.create()
        const travelSegment = travelSegmentFactory.build({
          departureOn: faker.date.past(),
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [travelSegment],
          })
          .transient({
            include: ["user", "travelDeskTravelRequest", "travelSegments"],
          })
          .create({
            status: TravelAuthorization.Statuses.SUBMITTED,
          })

        const result = IndexSerializer.perform(travelAuthorization, currentUser)

        expect(result).toEqual(
          expect.objectContaining({
            phase: "travel_approval",
            action: [],
          })
        )
      })

      test("when travel authorization is approved, and travelling is complete, the travel action includes submit_expense_claim", async () => {
        const currentUser = await userFactory.create()
        const travelSegment = travelSegmentFactory.build({
          departureOn: faker.date.past(),
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            travelSegments: [travelSegment],
          })
          .transient({
            include: ["user", "travelDeskTravelRequest", "travelSegments"],
          })
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
          })

        const result = IndexSerializer.perform(travelAuthorization, currentUser)

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
