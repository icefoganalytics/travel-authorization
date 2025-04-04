import { faker } from "@faker-js/faker"

import { Expense, TravelAuthorization } from "@/models"
import PrefillService from "@/services/expenses/prefill-service"
import { expenseFactory, travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

describe("api/src/services/expenses/prefill-service.ts", () => {
  describe("PrefillService", () => {
    describe(".perform", () => {
      test("when given some estimates, it prefills expenses from them", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: faker.date.past(),
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Aircraft from Whitehorse to Vancouver",
          date: new Date("2022-06-05"),
          cost: 350.0,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Hotel in Vancouver",
          date: new Date("2022-06-05"),
          cost: 250.0,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Hotel in Vancouver",
          date: new Date("2022-06-06"),
          cost: 250.0,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Aircraft from Vancouver to Whitehorse",
          date: new Date("2022-06-07"),
          cost: 350.0,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Breakfast/Lunch/Dinner",
          date: new Date("2022-06-05"),
          cost: 106.1,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Breakfast/Lunch/Dinner/Incidentals",
          date: new Date("2022-06-06"),
          cost: 123.4,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          description: "Breakfast/Lunch/Incidentals",
          date: new Date("2022-06-07"),
          cost: 64.8,
          currency: "CAD",
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        const estimates = await Expense.findAll({
          where: {
            travelAuthorizationId: travelAuthorization.id,
            type: Expense.Types.ESTIMATE,
          },
        })

        // Act
        const expenses = await PrefillService.perform(travelAuthorization.id, estimates)

        // Assert
        expect(expenses).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2022-06-05",
            cost: 250.0,
            currency: "CAD",
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2022-06-06",
            cost: 250.0,
            currency: "CAD",
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner",
            date: "2022-06-05",
            cost: 106.1,
            currency: "CAD",
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: "2022-06-06",
            cost: 123.4,
            currency: "CAD",
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Incidentals",
            date: "2022-06-07",
            cost: 64.8,
            currency: "CAD",
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
        ])
      })

      test("when travel authorization is not approved, errors informatively", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
          status: TravelAuthorization.Statuses.DENIED,
        })

        // Assert
        expect.assertions(1)
        await expect(
          // Act
          PrefillService.perform(travelAuthorization.id, [])
        ).rejects.toThrow("Can only prefill expenses for approved travel authorizations.")
      })

      test("when travel authorization is approved but current date is not after travel start date, errors informatively", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create({
          tripType: TravelAuthorization.TripTypes.ROUND_TRIP,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          departureOn: faker.date.future(),
        })

        // Assert
        expect.assertions(1)
        await expect(
          // Act
          PrefillService.perform(travelAuthorization.id, [])
        ).rejects.toThrow("Can only prefill expenses after travel start date.")
      })
    })
  })
})
