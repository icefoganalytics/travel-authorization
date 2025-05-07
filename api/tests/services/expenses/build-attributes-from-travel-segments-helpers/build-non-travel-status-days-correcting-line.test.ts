import { CreationAttributes } from "sequelize"
import { faker } from "@faker-js/faker"

import { expenseFactory } from "@/factories"
import { Expense } from "@/models"

import { buildNonTravelStatusDaysCorrectingLine } from "@/services/expenses/build-attributes-from-travel-segments-helpers"

describe("api/src/services/expenses/build-attributes-from-travel-segments-helpers/build-non-travel-status-days-correcting-line.ts", () => {
  describe("buildNonTravelStatusDaysCorrectingLine", () => {
    test("when given some expense attributes and an expense type, and 2 days off travel status, returns the expected correcting entry", () => {
      // Arrange
      const accommodation1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        .build({
          cost: 250,
          date: new Date("2022-06-05"),
        })
      const accommodation2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        .build({
          cost: 250,
          date: new Date("2022-06-06"),
        })
      const transportation1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        .build({
          cost: 350,
          date: new Date("2022-06-05"),
        })
      const transportation2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        .build({
          cost: 350,
          date: new Date("2022-06-07"),
        })
      const mealsAndIncidentals1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 98.45,
          date: new Date("2022-06-05"),
        })
      const mealsAndIncidentals2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 115.75,
          date: new Date("2022-06-06"),
        })
      const mealsAndIncidentals3 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 61.35,
          date: new Date("2022-06-07"),
        })

      const expensesAttributes: CreationAttributes<Expense>[] = [
        accommodation1.dataValues,
        accommodation2.dataValues,
        transportation1.dataValues,
        transportation2.dataValues,
        mealsAndIncidentals1.dataValues,
        mealsAndIncidentals2.dataValues,
        mealsAndIncidentals3.dataValues,
      ]
      const daysOffTravelStatus = 2
      const travelAuthorizationId = faker.number.int({ min: 1, max: 1000 })
      const travelEndAt = faker.date.soon({ days: 30 })

      // Act
      const result = buildNonTravelStatusDaysCorrectingLine({
        expensesAttributes,
        daysOffTravelStatus,
        travelAuthorizationId,
        travelEndAt,
        type: Expense.Types.ESTIMATE,
      })

      // Assert
      expect(result).toEqual({
        type: Expense.Types.ESTIMATE,
        expenseType: Expense.ExpenseTypes.NON_TRAVEL_STATUS,
        travelAuthorizationId,
        currency: "CAD",
        cost: -677.1,
        description: `2 day @ non-travel status per diem -177.10 and 2 day @ non-travel status accommodation -500.00`,
        date: travelEndAt,
      })
    })

    test("when given some expense attributes and an expense type, and 1 day off travel status, assumes non travel status day is final day", () => {
      // Arrange
      const accommodation1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        .build({
          cost: 250,
          date: new Date("2022-06-05"),
        })
      const accommodation2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        .build({
          cost: 250,
          date: new Date("2022-06-06"),
        })
      const transportation1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        .build({
          cost: 350,
          date: new Date("2022-06-05"),
        })
      const transportation2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        .build({
          cost: 350,
          date: new Date("2022-06-07"),
        })
      const mealsAndIncidentals1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 98.45,
          date: new Date("2022-06-05"),
        })
      const mealsAndIncidentals2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 115.75,
          date: new Date("2022-06-06"),
        })
      const mealsAndIncidentals3 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 61.35,
          date: new Date("2022-06-07"),
        })
      const expensesAttributes: CreationAttributes<Expense>[] = [
        accommodation1.dataValues,
        accommodation2.dataValues,
        transportation1.dataValues,
        transportation2.dataValues,
        mealsAndIncidentals1.dataValues,
        mealsAndIncidentals2.dataValues,
        mealsAndIncidentals3.dataValues,
      ]
      const daysOffTravelStatus = 1
      const travelAuthorizationId = faker.number.int({ min: 1, max: 1000 })
      const travelEndAt = faker.date.soon({ days: 30 })

      // Act
      const result = buildNonTravelStatusDaysCorrectingLine({
        expensesAttributes,
        daysOffTravelStatus,
        travelAuthorizationId,
        travelEndAt,
        type: Expense.Types.ESTIMATE,
      })

      // Assert
      expect(result).toEqual({
        type: Expense.Types.ESTIMATE,
        expenseType: Expense.ExpenseTypes.NON_TRAVEL_STATUS,
        travelAuthorizationId,
        currency: "CAD",
        cost: -311.35,
        description: `1 day @ non-travel status per diem -61.35 and 1 day @ non-travel status accommodation -250.00`,
        date: travelEndAt,
      })
    })

    test("when no travel status days are longer than trip, maxes out at number or relevant entries per expense type", () => {
      // Arrange
      const accommodation1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        .build({
          cost: 250,
          date: new Date("2022-06-05"),
        })
      const accommodation2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
        })
        .build({
          cost: 250,
          date: new Date("2022-06-06"),
        })
      const transportation1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        .build({
          cost: 350,
          date: new Date("2022-06-05"),
        })
      const transportation2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
        })
        .build({
          cost: 350,
          date: new Date("2022-06-07"),
        })
      const mealsAndIncidentals1 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 98.45,
          date: new Date("2022-06-05"),
        })
      const mealsAndIncidentals2 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 115.75,
          date: new Date("2022-06-06"),
        })
      const mealsAndIncidentals3 = expenseFactory
        .estimate({
          expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
        })
        .build({
          cost: 61.35,
          date: new Date("2022-06-07"),
        })
      const expensesAttributes: CreationAttributes<Expense>[] = [
        accommodation1.dataValues,
        accommodation2.dataValues,
        transportation1.dataValues,
        transportation2.dataValues,
        mealsAndIncidentals1.dataValues,
        mealsAndIncidentals2.dataValues,
        mealsAndIncidentals3.dataValues,
      ]
      const daysOffTravelStatus = 3
      const travelAuthorizationId = faker.number.int({ min: 1, max: 1000 })
      const travelEndAt = faker.date.soon({ days: 30 })

      // Act
      const result = buildNonTravelStatusDaysCorrectingLine({
        expensesAttributes,
        daysOffTravelStatus,
        travelAuthorizationId,
        travelEndAt,
        type: Expense.Types.ESTIMATE,
      })

      // Assert
      expect(result).toEqual({
        type: Expense.Types.ESTIMATE,
        expenseType: Expense.ExpenseTypes.NON_TRAVEL_STATUS,
        travelAuthorizationId,
        currency: "CAD",
        cost: -775.55,
        description: `3 day @ non-travel status per diem -275.55 and 2 day @ non-travel status accommodation -500.00`,
        date: travelEndAt,
      })
    })
  })
})
