import { BulkGenerateService } from "@/services/estimates"

import {
  distanceMatrixFactory,
  locationFactory,
  perDiemFactory,
  travelAllowanceFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
} from "@/factories"
import { PerDiem, Stop, TravelAllowance, TravelAuthorization } from "@/models"

describe("api/src/services/estimates/bulk-generate-service.ts", () => {
  describe("BulkGenerateService", () => {
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
      test("creates some new estimates against the travel authorization", async () => {
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

        const expenses = await BulkGenerateService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0
        )

        expect(expenses).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Whitehorse to Vancouver",
            date: "2022-06-05",
            cost: 350.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2022-06-05",
            cost: 250.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Accommodations",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2022-06-06",
            cost: 250.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Accommodations",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Vancouver to Whitehorse",
            date: "2022-06-07",
            cost: 350.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner",
            date: "2022-06-05",
            cost: 106.1,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: "2022-06-06",
            cost: 123.4,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Incidentals",
            date: "2022-06-07",
            cost: 64.8,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
        ])
      })

      test("when times are not specified, defaults to full day times", async () => {
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

        const expenses = await BulkGenerateService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0
        )

        expect(expenses).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Whitehorse to Vancouver",
            date: "2022-06-05",
            cost: 350.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2022-06-05",
            cost: 250.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Accommodations",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2022-06-06",
            cost: 250.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Accommodations",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Vancouver to Whitehorse",
            date: "2022-06-07",
            cost: 350.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner",
            date: "2022-06-05",
            cost: 106.1,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: "2022-06-06",
            cost: 123.4,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: "2022-06-07",
            cost: 123.4,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
        ])
      })

      test("when departure time is late in the day, no claims are generated for that day", async () => {
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

        const expenses = await BulkGenerateService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0
        )

        expect(expenses).toEqual([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Whitehorse to Vancouver",
            date: "2025-01-31",
            cost: 350.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Hotel in Vancouver",
            date: "2025-01-31",
            cost: 250.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Accommodations",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Aircraft from Vancouver to Whitehorse",
            date: "2025-02-01",
            cost: 350.0,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Breakfast/Lunch/Dinner/Incidentals",
            date: "2025-02-01",
            cost: 123.40,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Meals & Incidentals",
          }),
        ])
      })

      test("when travel method is personal vehicle, and trip type is round-trip, correctly generates the transportantion allowance from the distance matrix", async () => {
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

        const expenses = await BulkGenerateService.perform(
          travelAuthorization.id,
          [travelSegment1, travelSegment2],
          0
        )

        expect(expenses).toEqual(expect.arrayContaining([
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Personal Vehicle from Whitehorse to Faro",
            date: "2022-06-05",
            cost: 217.195,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            description: "Personal Vehicle from Faro to Whitehorse",
            date: "2022-06-07",
            cost: 217.195,
            currency: "CAD",
            type: "Estimate",
            expenseType: "Transportation",
          }),
        ]))
      })
    })
  })
})
