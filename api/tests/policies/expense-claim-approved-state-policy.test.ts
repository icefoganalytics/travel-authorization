import { TravelAuthorization, User } from "@/models"
import { ExpenseClaimApprovedStatePolicy } from "@/policies/travel-authorizations"

import { travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-authorizations/expense-claim-approved-state-policy.ts", () => {
  describe("ExpenseClaimApprovedStatePolicy", () => {
    describe("#update", () => {
      test("when user is a finance user in the same department, allows update", () => {
        const financeUser = userFactory.build({
          roles: [User.Roles.FINANCE_USER],
          department: "Community Services",
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          department: "Community Services",
        })

        const policy = new ExpenseClaimApprovedStatePolicy(financeUser, travelAuthorization)

        expect(policy.update()).toBe(true)
      })

      test("when user is a finance user in a different department, denies update", () => {
        const financeUser = userFactory.build({
          roles: [User.Roles.FINANCE_USER],
          department: "Highways and Public Works",
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          department: "Community Services",
        })

        const policy = new ExpenseClaimApprovedStatePolicy(financeUser, travelAuthorization)

        expect(policy.update()).toBe(false)
      })

      test("when user is admin, allows update", () => {
        const admin = userFactory.build({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
        })

        const policy = new ExpenseClaimApprovedStatePolicy(admin, travelAuthorization)

        expect(policy.update()).toBe(true)
      })

      test("when user is the supervisor, denies update", () => {
        const supervisor = userFactory.build({
          email: "supervisor@example.com",
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          supervisorEmail: "supervisor@example.com",
        })

        const policy = new ExpenseClaimApprovedStatePolicy(supervisor, travelAuthorization)

        expect(policy.update()).toBe(false)
      })

      test("when user is the traveller, denies update", () => {
        const traveller = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          userId: traveller.id,
        })

        const policy = new ExpenseClaimApprovedStatePolicy(traveller, travelAuthorization)

        expect(policy.update()).toBe(false)
      })

      test("when user is an unrelated regular user, denies update", () => {
        const stranger = userFactory.build({
          roles: [User.Roles.USER],
          department: "Community Services",
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED,
          department: "Community Services",
          userId: -1,
          supervisorEmail: "someone-else@example.com",
        })

        const policy = new ExpenseClaimApprovedStatePolicy(stranger, travelAuthorization)

        expect(policy.update()).toBe(false)
      })
    })
  })
})
