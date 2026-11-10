import { Expense, PerDiem, Stop, TravelAllowance, TravelAuthorization } from "@/models"
import BuildAttributesFromTravelSegmentsService from "@/services/expenses/build-attributes-from-travel-segments-service"

import {
  locationFactory,
  perDiemFactory,
  travelAllowanceFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/factories"

describe("api/src/services/expenses/build-attributes-from-travel-segments-service.ts", () => {
  describe("BuildAttributesFromTravelSegmentsService", () => {
    describe(".perform", () => {
      test("when prefilling a trip with aircraft and rental vehicle travel, it excludes airfare but retains other expenses", async () => {
        // Arrange
        for (const [claimType, amount] of [
          [PerDiem.ClaimTypes.INCIDENTALS, 17.3],
          [PerDiem.ClaimTypes.BREAKFAST, 23.6],
          [PerDiem.ClaimTypes.LUNCH, 23.9],
          [PerDiem.ClaimTypes.DINNER, 58.6],
          [PerDiem.ClaimTypes.PRIVATE_ACCOMMODATIONS, 50],
        ] as const) {
          await perDiemFactory.create({
            claimType,
            amount,
            travelRegion: PerDiem.TravelRegions.CANADA,
            currency: PerDiem.CurrencyTypes.CAD,
          })
        }
        for (const [allowanceType, amount] of [
          [TravelAllowance.AllowanceTypes.MAXIUM_AIRCRAFT_ALLOWANCE, 1000],
          [TravelAllowance.AllowanceTypes.AIRCRAFT_ALLOWANCE_PER_SEGMENT, 350],
          [TravelAllowance.AllowanceTypes.DISTANCE_ALLOWANCE_PER_KILOMETER, 0.605],
          [TravelAllowance.AllowanceTypes.HOTEL_ALLOWANCE_PER_NIGHT, 250],
        ] as const) {
          await travelAllowanceFactory.create({
            allowanceType,
            amount,
            currency: TravelAllowance.CurrencyTypes.CAD,
          })
        }

        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse", province: "YT" })
        const vancouver = await locationFactory.create({ city: "Vancouver", province: "BC" })
        const travelSegment1 = await travelSegmentFactory
          .associations({
            travelAuthorization,
            departureLocation: whitehorse,
            arrivalLocation: vancouver,
          })
          .create({
            isActual: true,
            segmentNumber: 1,
            departureOn: new Date("2022-06-05"),
            departureTime: Stop.BEGINNING_OF_DAY,
            modeOfTransport: Stop.TravelMethods.AIRCRAFT,
            accommodationType: Stop.AccommodationTypes.HOTEL,
          })
        const travelSegment2 = await travelSegmentFactory
          .associations({
            travelAuthorization,
            departureLocation: vancouver,
            arrivalLocation: whitehorse,
          })
          .create({
            isActual: true,
            segmentNumber: 2,
            departureOn: new Date("2022-06-07"),
            departureTime: "15:00:00",
            modeOfTransport: Stop.TravelMethods.RENTAL_VEHICLE,
            accommodationType: null,
          })

        // Act
        const expensesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0,
          Expense.Types.EXPENSE
        )

        // Assert
        expect(expensesAttributes).toEqual([
          expect.objectContaining({
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
            description: "Hotel in Vancouver",
            date: new Date("2022-06-05"),
            cost: 250,
          }),
          expect.objectContaining({
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
            description: "Hotel in Vancouver",
            date: new Date("2022-06-06"),
            cost: 250,
          }),
          expect.objectContaining({
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
            description: "Rental Vehicle from Vancouver to Whitehorse",
            date: new Date("2022-06-07T15:00:00Z"),
            cost: 0,
          }),
          expect.objectContaining({
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
            description: "Breakfast/Lunch/Dinner",
            date: new Date("2022-06-05"),
            cost: 106.1,
          }),
          expect.objectContaining({
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: new Date("2022-06-06"),
            cost: 123.4,
          }),
          expect.objectContaining({
            type: Expense.Types.EXPENSE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
            description: "Breakfast/Lunch/Incidentals",
            date: new Date("2022-06-07T15:00:00Z"),
            cost: 64.8,
          }),
        ])
      })
    })
  })
})
