import { Expense, TravelAuthorization, User } from "@/models"
import { expenseFactory, travelAuthorizationFactory, userFactory } from "@/factories"

import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/expenses-controller.ts", () => {
  let user: User

  beforeEach(async () => {
    user = await userFactory.create({
      roles: [User.Roles.USER],
    })
    mockCurrentUser(user)
  })

  describe("ExpensesController", () => {
    describe("#create - POST /api/expenses", () => {
      test("when authorized and expense creation is successful", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
          status: TravelAuthorization.Statuses.DRAFT,
        })
        const newExpenseAttributes = expenseFactory.attributesFor({
          travelAuthorizationId: travelAuthorization.id,
          type: Expense.Types.ESTIMATE,
          currency: Expense.CurrencyTypes.CAD,
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          description: "Hotel in Vancouver",
          cost: 250.0,
          date: new Date("2023-12-22"),
        })

        // Act
        const response = await request().post("/api/expenses").send(newExpenseAttributes)

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          expense: expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            type: Expense.Types.ESTIMATE,
            currency: "CAD",
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
            description: "Hotel in Vancouver",
            cost: 250.0,
            date: "2023-12-22",
          }),
        })
      })
    })
  })
})
