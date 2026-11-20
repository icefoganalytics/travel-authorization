import { TravelAuthorization, User } from "@/models"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-segments-policy.ts", () => {
  describe("TravelSegmentsPolicy", () => {
    describe("policyScope", () => {
      test("when finance lists actual legs for other travellers, returns only claims in their department", async () => {
        const financeUser = await userFactory.create({
          roles: [User.Roles.FINANCE_USER],
          department: "Community Services",
        })
        const departmentClaim = await travelAuthorizationFactory.create({
          department: "Community Services",
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
        })
        const outsideClaim = await travelAuthorizationFactory.create({
          department: "Highways and Public Works",
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
        })
        const departmentLeg = await travelSegmentFactory.create({
          travelAuthorizationId: departmentClaim.id,
          isActual: true,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: outsideClaim.id,
          isActual: true,
        })

        const visibleLegs = await TravelSegmentsPolicy.applyScope([], financeUser).findAll({
          where: { isActual: true },
        })

        expect(visibleLegs.map((leg) => leg.id)).toEqual([departmentLeg.id])
      })
    })
  })
})
