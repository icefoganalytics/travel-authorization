import qs from "qs"

import { Expense, TravelAuthorization, User } from "@/models"

import { expenseFactory, travelAuthorizationFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/expenses-controller.ts", () => {
  describe("ExpensesController", () => {
    describe("#index - GET /api/expenses", () => {
      test.each([
        {
          direction: "ASC",
          expectedExpenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        },
        {
          direction: "DESC",
          expectedExpenseType: Expense.ExpenseTypes.TRANSPORTATION,
        },
      ])(
        "when sorting by expenseType $direction, it orders before pagination",
        async ({ direction, expectedExpenseType }) => {
          // Arrange
          const user = await userFactory.create({
            roles: [User.Roles.USER],
          })
          mockCurrentUser(user)
          const travelAuthorization = await travelAuthorizationFactory
            .associations({ user })
            .create({
              status: TravelAuthorization.Statuses.DRAFT,
            })
          await expenseFactory.associations({ travelAuthorization }).create({
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
            date: "2026-11-10",
            cost: 120,
          })
          await expenseFactory.associations({ travelAuthorization }).create({
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
            date: "2026-11-10",
            cost: 30,
          })
          const query = qs.stringify({
            where: {
              travelAuthorizationId: travelAuthorization.id,
              type: Expense.Types.ESTIMATE,
            },
            order: [
              ["date", "ASC"],
              ["expenseType", direction],
            ],
            perPage: 1,
          })

          // Act
          const response = await request().get("/api/expenses").query(query)

          // Assert
          expect(response.status).toEqual(200)
          expect(response.body).toEqual({
            expenses: [
              expect.objectContaining({
                expenseType: expectedExpenseType,
              }),
            ],
            totalCount: 2,
            summaries: {
              totalCost: 150,
            },
          })
        }
      )
    })

    describe("#create - POST /api/expenses", () => {
      test("when authorized, it creates an expense", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user)
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
