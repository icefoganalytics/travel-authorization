import { Expense, PerDiem, Stop, TravelAllowance, TravelAuthorization, User } from "@/models"
import { PrefillService } from "@/services/expenses"

import { mockCurrentUser, request, testWithCustomLogLevel } from "@/support"
import {
  locationFactory,
  perDiemFactory,
  travelAllowanceFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/controllers/travel-authorizations/expenses/prefill-controller.ts", () => {
  let user: User

  beforeEach(async () => {
    user = await userFactory.create({
      roles: [User.Roles.USER],
    })
    mockCurrentUser(user)
  })

  describe("POST /api/travel-authorizations/:travelAuthorizationId/expenses/prefill", () => {
    test("when the current user is authorized and expense prefill is successful, it serializes prefilled expenses", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
        status: TravelAuthorization.Statuses.DRAFT,
      })
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
      const whitehorse = await locationFactory.create({ city: "Whitehorse", province: "YT" })
      const vancouver = await locationFactory.create({ city: "Vancouver", province: "BC" })
      await travelSegmentFactory
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
          modeOfTransport: Stop.TravelMethods.POOL_VEHICLE,
          accommodationType: null,
        })

      // Act
      const response = await request()
        .post(`/api/travel-authorizations/${travelAuthorization.id}/expenses/prefill`)
        .expect("Content-Type", /json/)

      // Assert
      expect(response.status).toEqual(201)
      expect(response.body).toEqual({
        expenses: expect.arrayContaining([
          expect.objectContaining({
            expenseType: Expense.ExpenseTypes.TRANSPORTATION,
            description: "Pool Vehicle from Whitehorse to Vancouver",
            cost: 0,
            receipt: null,
            actions: ["edit", "delete"],
          }),
          expect.objectContaining({
            expenseType: Expense.ExpenseTypes.MEALS_AND_INCIDENTALS,
            description: "Breakfast/Lunch/Dinner",
            cost: 106.1,
            receipt: null,
            actions: ["delete"],
          }),
        ]),
      })
    })

    testWithCustomLogLevel(
      "when the current user is authorized and expense prefill is not successful, it errors informatively",
      async ({ setLogLevel }) => {
        // Arrange
        setLogLevel("silent")

        const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        const mockPrefillServicePerformResponse = "mock prefill response"
        vi.spyOn(PrefillService, "perform").mockRejectedValueOnce(mockPrefillServicePerformResponse)

        // Act
        const response = await request().post(
          `/api/travel-authorizations/${travelAuthorization.id}/expenses/prefill`
        )

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: `Failed to prefill expenses: ${mockPrefillServicePerformResponse}`,
        })
      }
    )

    test("when the current user is not authorized to create expenses for the travel authorization, it errors informatively", async () => {
      // Arrange
      const otherUser = await userFactory.create({
        roles: [User.Roles.USER],
      })
      const travelAuthorization = await travelAuthorizationFactory
        .associations({
          user: otherUser,
        })
        .create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

      // Act
      const response = await request()
        .post(`/api/travel-authorizations/${travelAuthorization.id}/expenses/prefill`)
        .expect("Content-Type", /json/)

      // Assert
      expect(response.status).toEqual(403)
      expect(response.body).toEqual({
        message: "You are not authorized to prefill expenses.",
      })
    })

    test("when the travel authorization does not exist, it errors informatively", async () => {
      // Arrange
      const invalidTravelAuthorizationId = -1

      // Act
      const response = await request()
        .post(`/api/travel-authorizations/${invalidTravelAuthorizationId}/expenses/prefill`)
        .expect("Content-Type", /json/)

      // Assert
      expect(response.status).toEqual(404)
      expect(response.body).toEqual({
        message: "Travel authorization not found.",
      })
    })
  })
})
