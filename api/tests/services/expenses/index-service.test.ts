import { IndexService } from "@/services/expenses"
import { expenseFactory, travelAuthorizationFactory, userFactory } from "@/factories"
import { User } from "@/models"

describe("api/src/services/expenses/index-service.ts", () => {
  describe("IndexService", () => {
    describe(".perform", () => {
      test("when called without filters, it returns all records and their total cost", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        const expense1 = await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 100,
        })
        const expense2 = await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 200,
        })

        // Act
        const result = await IndexService.perform({}, [], [["id", "ASC"]], 10, 0, user)

        // Assert
        expect(result).toEqual({
          expenses: [
            expect.objectContaining({
              id: expense1.id,
            }),
            expect.objectContaining({
              id: expense2.id,
            }),
          ],
          totalCount: 2,
          summaries: {
            totalCost: 300,
          },
        })
      })

      test("when called with a where filter, it scopes count, sum, and records", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 100,
        })
        const matchingExpense = await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 200,
        })

        // Act
        const result = await IndexService.perform(
          { id: matchingExpense.id },
          [],
          undefined,
          10,
          0,
          user
        )

        // Assert
        expect(result).toEqual({
          expenses: [
            expect.objectContaining({
              id: matchingExpense.id,
            }),
          ],
          totalCount: 1,
          summaries: {
            totalCost: 200,
          },
        })
      })

      test("when called with pagination, it returns only the requested page", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 100,
        })
        const secondExpense = await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 200,
        })

        // Act — page 2, offset 1
        const result = await IndexService.perform({}, [], [["id", "ASC"]], 1, 1, user)

        // Assert
        expect(result).toEqual({
          expenses: [
            expect.objectContaining({
              id: secondExpense.id,
            }),
          ],
          totalCount: 2,
          summaries: {
            totalCost: 300,
          },
        })
      })

      test("when there are no records, it returns empty results and zero totals", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })

        // Act
        const result = await IndexService.perform({}, [], undefined, 10, 0, user)

        // Assert
        expect(result).toEqual({
          expenses: [],
          totalCount: 0,
          summaries: {
            totalCost: 0,
          },
        })
      })

      test("when policy scope restricts access, it only returns authorized records", async () => {
        // Arrange
        const adminUser = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: adminUser.id,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          cost: 100,
        })

        const otherUser = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const otherTravelAuthorization = await travelAuthorizationFactory.create({
          userId: otherUser.id,
        })
        const otherExpense = await expenseFactory.create({
          travelAuthorizationId: otherTravelAuthorization.id,
          cost: 200,
        })

        // Act — otherUser can only see their own records
        const result = await IndexService.perform({}, [], undefined, 10, 0, otherUser)

        // Assert
        expect(result).toEqual({
          expenses: [
            expect.objectContaining({
              id: otherExpense.id,
            }),
          ],
          totalCount: 1,
          summaries: {
            totalCost: 200,
          },
        })
      })
    })
  })
})
