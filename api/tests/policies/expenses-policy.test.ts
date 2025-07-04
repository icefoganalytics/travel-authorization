import { ExpensesPolicy, TravelAuthorizationsPolicy } from "@/policies"
import { Expense, TravelAuthorization, User } from "@/models"
import { expenseFactory, travelAuthorizationFactory, userFactory } from "@/factories"

vi.mock("@/policies/travel-authorizations-policy", () => {
  const policyMock = vi.fn()
  policyMock.prototype.update = vi.fn()
  return {
    TravelAuthorizationsPolicy: policyMock,
    default: policyMock,
  }
})

const travelAuthorizationPolicyInstanceMock = vi.mocked(TravelAuthorizationsPolicy.prototype)

describe("api/src/policies/expenses-policy.ts", () => {
  describe("ExpensesPolicy", () => {
    describe("create", () => {
      test("when travel authorization policy permits updates, returns true", () => {
        const user = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.DRAFT,
          userId: user.id,
        })
        const expense = expenseFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          type: Expense.Types.EXPENSE,
        })

        travelAuthorizationPolicyInstanceMock.update.mockReturnValue(true)

        const policy = new ExpensesPolicy(user, expense)

        expect(policy.create()).toBe(true)
      })

      test("when travel authorization policy rejects updates, returns false", () => {
        const user = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.APPROVED,
          userId: user.id,
        })
        const expense = expenseFactory.build({
          travelAuthorizationId: travelAuthorization.id,
          type: Expense.Types.EXPENSE,
        })

        travelAuthorizationPolicyInstanceMock.update.mockReturnValue(false)

        const policy = new ExpensesPolicy(user, expense)

        expect(policy.create()).toBe(false)
      })
    })
  })
})
