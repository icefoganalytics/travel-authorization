import { BuildAttributesFromTravelSegmentsService } from "@/services/expenses"

import {
  distanceMatrixFactory,
  locationFactory,
  perDiemFactory,
  travelAllowanceFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/factories"
import { Expense, PerDiem, Stop, TravelAllowance, TravelAuthorization } from "@/models"

describe("api/src/services/expenses/build-attributes-from-travel-segments-service.ts", () => {
  describe("BuildAttributesFromTravelSegmentsService", () => {
    beforeEach(async () => {
      await perDiemFactory.create({
        claimType: PerDiem.ClaimTypes.INCIDENTALS,
        travelRegion: PerDiem.TravelRegions.CANADA,
        amount: 17.3,
        currency: PerDiem.CurrencyTypes.CAD,
      })
      await perDiemFactory.create({
        claimType: PerDiem.ClaimTypes.BREAKFAST,
        travelRegion: PerDiem.TravelRegions.CANADA,
        amount: 23.6,
        currency: PerDiem.CurrencyTypes.CAD,
      })
      await perDiemFactory.create({
        claimType: PerDiem.ClaimTypes.LUNCH,
        travelRegion: PerDiem.TravelRegions.CANADA,
        amount: 23.9,
        currency: PerDiem.CurrencyTypes.CAD,
      })
      await perDiemFactory.create({
        claimType: PerDiem.ClaimTypes.DINNER,
        travelRegion: PerDiem.TravelRegions.CANADA,
        amount: 58.6,
        currency: PerDiem.CurrencyTypes.CAD,
      })
      await perDiemFactory.create({
        claimType: PerDiem.ClaimTypes.PRIVATE_ACCOMMODATIONS,
        travelRegion: PerDiem.TravelRegions.CANADA,
        amount: 50,
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
    })

    describe(".perform", () => {
      test("when provided some travel segments, and a expense type to create, builds the appropriate expense attributes", async () => {
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
            segmentNumber: 2,
            departureOn: new Date("2022-06-07"),
            departureTime: "15:00:00",
            modeOfTransport: Stop.TravelMethods.AIRCRAFT,
            accommodationType: null,
          })

        const expensesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0,
          Expense.Types.ESTIMATE
        )

        expect(expensesAttributes).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Whitehorse to Vancouver",
            date: new Date("2022-06-05"),
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: new Date("2022-06-05"),
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: new Date("2022-06-06"),
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Vancouver to Whitehorse",
            date: new Date("2022-06-07 15:00:00"),
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner",
            date: new Date("2022-06-05"),
            cost: 106.1,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: new Date("2022-06-06"),
            cost: 123.4,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Incidentals",
            date: new Date("2022-06-07 15:00:00"),
            cost: 64.8,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
        ])
      })

      test("when provided some travel segments, and a expense type to create, and when times are not specified, it defaults to full day times when building the expense attributes", async () => {
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
            segmentNumber: 1,
            departureOn: new Date("2022-06-05"),
            departureTime: null,
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
            segmentNumber: 2,
            departureOn: new Date("2022-06-07"),
            departureTime: null,
            modeOfTransport: Stop.TravelMethods.AIRCRAFT,
            accommodationType: null,
          })

        const expensesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0,
          Expense.Types.ESTIMATE
        )

        expect(expensesAttributes).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Whitehorse to Vancouver",
            date: new Date("2022-06-05"),
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: new Date("2022-06-05"),
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: new Date("2022-06-06"),
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Vancouver to Whitehorse",
            date: new Date("2022-06-07"),
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner",
            date: new Date("2022-06-05"),
            cost: 106.1,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: new Date("2022-06-06"),
            cost: 123.4,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: new Date("2022-06-07 23:59:59"),
            cost: 123.4,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
        ])
      })

      test("when provided some travel segments, and a expense type to create, and when departure time is late in the day, no claims are generated for that day when building the expense attributes", async () => {
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
            segmentNumber: 1,
            departureOn: new Date("2025-01-31"),
            departureTime: "22:47:00",
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
            segmentNumber: 2,
            departureOn: new Date("2025-02-01"),
            departureTime: "23:32:00",
            modeOfTransport: Stop.TravelMethods.AIRCRAFT,
            accommodationType: null,
          })

        const expensesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0,
          Expense.Types.ESTIMATE
        )

        expect(expensesAttributes).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Whitehorse to Vancouver",
            date: new Date("2025-01-31 22:47:00"),
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: new Date("2025-01-31 22:47:00"),
            cost: 250.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.ACCOMMODATIONS,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Vancouver to Whitehorse",
            date: new Date("2025-02-01 23:32:00"),
            cost: 350.0,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: new Date("2025-02-01 23:32:00"),
            cost: 123.40,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
          }),
        ])
      })

      test("when provided some travel segments, and a expense type to create, and when travel method is personal vehicle, and trip type is round-trip, correctly generates the transportantion allowance from the distance matrix when building the expense attributes", async () => {
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.LUNCH,
          travelRegion: PerDiem.TravelRegions.YUKON,
          amount: 21.3,
          currency: PerDiem.CurrencyTypes.CAD,
        })
        await perDiemFactory.create({
          claimType: PerDiem.ClaimTypes.DINNER,
          travelRegion: PerDiem.TravelRegions.YUKON,
          amount: 61.45,
          currency: PerDiem.CurrencyTypes.CAD,
        })

        await distanceMatrixFactory.create({
          origin: "Faro",
          destination: "Whitehorse",
          kilometers: 359,
        })

        const travelAuthorization = await travelAuthorizationFactory.create({
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
        })
        const whitehorse = await locationFactory.create({ city: "Whitehorse", province: "YT" })
        const faro = await locationFactory.create({ city: "Faro", province: "YT" })
        const travelSegment1 = await travelSegmentFactory
          .associations({
            travelAuthorization,
            departureLocation: whitehorse,
            arrivalLocation: faro,
          })
          .create({
            segmentNumber: 1,
            departureOn: new Date("2022-06-05"),
            departureTime: "10:00:00",
            modeOfTransport: Stop.TravelMethods.PERSONAL_VEHICLE,
            accommodationType: Stop.AccommodationTypes.HOTEL,
          })
        const travelSegment2 = await travelSegmentFactory
          .associations({
            travelAuthorization,
            departureLocation: faro,
            arrivalLocation: whitehorse,
          })
          .create({
            segmentNumber: 2,
            departureOn: new Date("2022-06-07"),
            departureTime: "15:00:00",
            modeOfTransport: Stop.TravelMethods.PERSONAL_VEHICLE,
            accommodationType: null,
          })

        const expensesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0,
          Expense.Types.ESTIMATE
        )

        expect(expensesAttributes).toEqual(expect.arrayContaining([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Personal Vehicle from Whitehorse to Faro",
            date: new Date("2022-06-05 10:00:00"),
            cost: 217.195,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Personal Vehicle from Faro to Whitehorse",
            date: new Date("2022-06-07 15:00:00"),
            cost: 217.195,
            currency: Expense.CurrencyTypes.CAD,
            type: Expense.Types.ESTIMATE,
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          }),
        ]))
      })
    })
  })
})
