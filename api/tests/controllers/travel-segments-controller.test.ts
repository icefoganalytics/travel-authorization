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
      test("when the traveller confirms a returned actual destination, it ignores route and ownership edits", async () => {
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
        const timestamp = expect.any(String)

        // Act
        const response = await request()
          .patch(`/api/travel-segments/${travelSegment.id}`)
          .send({
            isPrimaryDestination: true,
            arrivalLocationId: null,
            departureOn: "2099-01-01",
            isActual: false,
            travelAuthorizationId: -1,
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelSegment: {
            id: travelSegment.id,
            travelAuthorizationId: travelAuthorization.id,
            isActual: true,
            isPrimaryDestination: true,
            departureLocationId: travelSegment.departureLocationId,
            arrivalLocationId: travelSegment.arrivalLocationId,
            segmentNumber: 1,
            departureOn: "2020-01-01",
            departureTime: "09:30",
            modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
            modeOfTransportOther: null,
            accommodationType: null,
            accommodationTypeOther: null,
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          policy: {
            show: true,
            create: false,
            update: true,
            destroy: false,
          },
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
          .send({ isPrimaryDestination: true })

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
          .send({ isPrimaryDestination: true })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel segment.",
        })
      })
    })
  })
})
