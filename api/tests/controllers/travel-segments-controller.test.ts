import { Expense, TravelAuthorization, TravelSegment, User } from "@/models"

import {
  expenseFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-segments-controller.ts", () => {
  describe("TravelSegmentsController", () => {
    describe("#update", () => {
      test("when the traveller edits a returned actual segment, it denies route changes", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(currentUser)
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: true,
            segmentNumber: 1,
            departureOn: "2020-01-01",
            departureTime: "09:30",
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            modeOfTransportOther: null,
            accommodationType: null,
            accommodationTypeOther: null,
          })
        await expenseFactory.associations({ travelAuthorization }).create({
          type: Expense.Types.EXPENSE,
        })

        // Act
        const response = await request()
          .patch(`/api/travel-segments/${travelSegment.id}`)
          .send({
            arrivalLocationId: null,
            departureOn: "2099-01-01",
            isActual: false,
            travelAuthorizationId: -1,
          })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel segment.",
        })
      })

      test("when another traveller targets a returned actual segment, it denies the correction", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(currentUser)
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true })

        // Act
        const response = await request()
          .patch(`/api/travel-segments/${travelSegment.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel segment.",
        })
      })

      test("when the traveller targets an estimated segment on a returned claim, it denies the correction", async () => {
        // Arrange
        const currentUser = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(currentUser)
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: currentUser.id,
          status: TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED,
        })
        const travelSegment = await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: false })

        // Act
        const response = await request()
          .patch(`/api/travel-segments/${travelSegment.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel segment.",
        })
      })
    })
  })
})
