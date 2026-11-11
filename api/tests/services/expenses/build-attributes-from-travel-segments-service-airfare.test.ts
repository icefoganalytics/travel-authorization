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
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.INCIDENTALS,
          amount: 17.3,
          travelRegion: PerDiem.TravelRegions.CANADA,
          currency: PerDiem.CurrencyTypes.CAD,
        })
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.BREAKFAST,
          amount: 23.6,
          travelRegion: PerDiem.TravelRegions.CANADA,
          currency: PerDiem.CurrencyTypes.CAD,
        })
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.LUNCH,
          amount: 23.9,
          travelRegion: PerDiem.TravelRegions.CANADA,
          currency: PerDiem.CurrencyTypes.CAD,
        })
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.DINNER,
          amount: 58.6,
          travelRegion: PerDiem.TravelRegions.CANADA,
          currency: PerDiem.CurrencyTypes.CAD,
        })
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.PRIVATE_ACCOMMODATIONS,
          amount: 50,
          travelRegion: PerDiem.TravelRegions.CANADA,
          currency: PerDiem.CurrencyTypes.CAD,
        })

        await travelAllowanceFactory.create({
          allowanceType: TravelAllowance.AllowanceTypes.MAXIUM_AIRCRAFT_ALLOWANCE,
          amount: 1000,
          currency: TravelAllowance.CurrencyTypes.CAD,
        })
        await travelAllowanceFactory.create({
          allowanceType: TravelAllowance.AllowanceTypes.AIRCRAFT_ALLOWANCE_PER_SEGMENT,
          amount: 350,
          currency: TravelAllowance.CurrencyTypes.CAD,
        })
        await travelAllowanceFactory.create({
          allowanceType: TravelAllowance.AllowanceTypes.DISTANCE_ALLOWANCE_PER_KILOMETER,
          amount: 0.605,
          currency: TravelAllowance.CurrencyTypes.CAD,
        })
        await travelAllowanceFactory.create({
          allowanceType: TravelAllowance.AllowanceTypes.HOTEL_ALLOWANCE_PER_NIGHT,
          amount: 250,
          currency: TravelAllowance.CurrencyTypes.CAD,
        })

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
