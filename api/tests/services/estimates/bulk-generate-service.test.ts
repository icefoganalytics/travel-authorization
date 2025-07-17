import { CreationAttributes } from "@sequelize/core"

import { Expense } from "@/models"
import { BulkGenerateService } from "@/services/estimates"
import BuildAttributesFromTravelSegmentsService from "@/services/expenses/build-attributes-from-travel-segments-service"
import { travelAuthorizationFactory, travelSegmentFactory } from "@/factories"

vi.mock("@/services/expenses/build-attributes-from-travel-segments-service", () => ({
  BuildAttributesFromTravelSegmentsService: {
    perform: vi.fn(),
  },
  default: {
    perform: vi.fn(),
  },
}))

describe("api/src/services/estimates/bulk-generate-service.ts", () => {
  describe("BulkGenerateService", () => {
    describe(".perform", () => {
      const mockedBuildAttributesFromTravelSegmentsServicePerform = vi.mocked(
        BuildAttributesFromTravelSegmentsService.perform
      )

      test("when called with valid parameters, calls BuildAttributesFromTravelSegmentsService with correct parameters", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelSegment1 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 1,
        })
        const travelSegment2 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 2,
        })
        const daysOffTravelStatus = 2
        const mockExpenseAttributes: CreationAttributes<Expense>[] = [
          {
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft transportation",
            date: "2022-06-05",
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          },
          {
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel accommodation",
            date: "2022-06-05",
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          },
        ]

        mockedBuildAttributesFromTravelSegmentsServicePerform.mockResolvedValue(
          mockExpenseAttributes
        )

        await BulkGenerateService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          daysOffTravelStatus
        )

        expect(mockedBuildAttributesFromTravelSegmentsServicePerform).toHaveBeenCalledWith(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          daysOffTravelStatus,
          Expense.Types.ESTIMATE
        )
      })

      test("when called with valid parameters, and BuildAttributesFromTravelSegmentsService returns some expenses attributes, it creates the appropriate expenses", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelSegment1 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 1,
        })
        const travelSegment2 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 2,
        })
        const daysOffTravelStatus = 2
        const mockExpenseAttributes: CreationAttributes<Expense>[] = [
          {
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft transportation",
            date: "2022-06-05",
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          },
          {
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel accommodation",
            date: "2022-06-05",
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          },
        ]

        mockedBuildAttributesFromTravelSegmentsServicePerform.mockResolvedValue(
          mockExpenseAttributes
        )

        await BulkGenerateService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          daysOffTravelStatus
        )

        const expenses = await Expense.findAll({
          where: {
            travelAuthorizationId: travelAuthorization.id,
            type: Expense.Types.ESTIMATE,
          },
        })
        expect(expenses).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft transportation",
            date: "2022-06-05",
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel accommodation",
            date: "2022-06-05",
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
        ])
      })

      test("when called with valid parameters, but BuildAttributesFromTravelSegmentsService throws an error, it propagates the error", async () => {
        const travelAuthorization = await travelAuthorizationFactory.create()
        const travelSegment1 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 1,
        })
        const travelSegment2 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 2,
        })
        const daysOffTravelStatus = 2

        mockedBuildAttributesFromTravelSegmentsServicePerform.mockRejectedValue(
          new Error("Something went wrong")
        )

        expect.assertions(1)
        await expect(
          BulkGenerateService.perform(
            travelAuthorization.id,
            [travelSegment1, travelSegment2],
            daysOffTravelStatus
          )
        ).rejects.toThrowError("Something went wrong")
      })
    })
  })
})
