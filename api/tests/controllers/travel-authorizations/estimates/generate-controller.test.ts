import { BulkGenerateService } from "@/services/estimates"
import { Expense, TravelAuthorization, User } from "@/models"
import BuildAttributesFromTravelSegmentsService from "@/services/expenses/build-attributes-from-travel-segments-service"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import { mockCurrentUser, request, testWithCustomLogLevel } from "@/support"

describe("api/src/controllers/travel-authorizations/estimates/generate-controller.ts", () => {
  let user: User

  beforeEach(async () => {
    user = await userFactory.create({
      roles: [User.Roles.USER],
    })
    mockCurrentUser(user)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("POST /api/travel-authorizations/:travelAuthorizationId/estimates/generate", () => {
    test("when authorized and bulk generation is successful", async () => {
      // Arrange
      const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
        status: TravelAuthorization.Statuses.DRAFT,
      })

      vi.spyOn(BuildAttributesFromTravelSegmentsService, "perform").mockResolvedValue([
        {
          travelAuthorizationId: travelAuthorization.id,
          type: Expense.Types.ESTIMATE,
          expenseType: Expense.ExpenseTypes.TRANSPORTATION,
          description: "Aircraft transportation",
          cost: 350,
          currency: Expense.CurrencyTypes.CAD,
        },
      ])

      // Act
      const response = await request()
        .post(`/api/travel-authorizations/${travelAuthorization.id}/estimates/generate`)
        .expect("Content-Type", /json/)

      // Assert
      expect(response).toMatchObject({
        status: 201,
        body: {
          estimates: [
            expect.objectContaining({
              expenseType: Expense.ExpenseTypes.TRANSPORTATION,
              description: "Aircraft transportation",
              cost: 350,
              receipt: null,
              actions: ["edit", "delete"],
            }),
          ],
          message: "Generated estimates",
        },
      })
    })

    testWithCustomLogLevel(
      "when authorized and bulk generation not is successful",
      async ({ setLogLevel }) => {
        // Arrange
        setLogLevel("silent")

        const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        const mockBulkGenerateServicePerformResponse = "mock bulk generate response"
        vi.spyOn(BulkGenerateService, "perform").mockRejectedValue(
          mockBulkGenerateServicePerformResponse
        )

        // Act
        const response = await request().post(
          `/api/travel-authorizations/${travelAuthorization.id}/estimates/generate`
        )
        // Assert
        expect(response).toMatchObject({
          status: 422,
          body: {
            message: `Failed to generate estimate: ${mockBulkGenerateServicePerformResponse}`,
          },
        })
      }
    )

    test("when not authorized", async () => {
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

      const response = await request()
        .post(`/api/travel-authorizations/${travelAuthorization.id}/estimates/generate`)
        .expect("Content-Type", /json/)

      expect(response).toMatchObject({
        status: 403,
        body: {
          message: "You are not authorized to create this expense.",
        },
      })
    })

    test("when travel authorization does not exist", async () => {
      const invalidTravelAuthorizationId = -1
      return request()
        .post(`/api/travel-authorizations/${invalidTravelAuthorizationId}/estimates/generate`)
        .expect("Content-Type", /json/)
        .expect(404, { message: "Travel authorization not found." })
    })
  })
})
