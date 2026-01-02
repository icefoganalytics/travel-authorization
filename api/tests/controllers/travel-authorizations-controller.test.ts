import { TravelAuthorization, TravelDeskTravelRequest, TravelSegment, User } from "@/models"
import {
  expenseFactory,
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorizations-controller.ts", () => {
  let user: User

  beforeEach(async () => {
    user = await userFactory.create({
      roles: [User.Roles.USER],
    })
    mockCurrentUser(user)
  })

  describe("TravelAuthorizationsController", () => {
    describe("#index - GET /api/travel-authorizations", () => {
      test("when travel desk travel request is null, returns 200 and serializes without error", async () => {
        // Arrange
        const travelAuthorization1 = await travelAuthorizationFactory.create({
          userId: user.id,
          status: TravelAuthorization.Statuses.DRAFT,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization1.id,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization1.id,
        })

        const travelAuthorization2 = await travelAuthorizationFactory.create({
          userId: user.id,
          status: TravelAuthorization.Statuses.APPROVED,
        })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization2.id,
        })
        await expenseFactory.create({
          travelAuthorizationId: travelAuthorization2.id,
        })
        await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization2.id,
          status: TravelDeskTravelRequest.Statuses.SUBMITTED,
        })

        // Act
        const response = await request().get(
          "/api/travel-authorizations?order[0][0]=createdAt&order[0][1]=DESC"
        )

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            travelAuthorizations: [
              expect.objectContaining({
                id: expect.any(Number),
                status: TravelAuthorization.Statuses.APPROVED,
                isTravelDeskDraft: false,
                isInTravelDeskFlow: true,
              }),
              expect.objectContaining({
                id: expect.any(Number),
                status: TravelAuthorization.Statuses.DRAFT,
                isTravelDeskDraft: false,
                isInTravelDeskFlow: false,
              }),
            ],
            totalCount: 2,
          })
        )
      })
    })

    describe("#create - POST /api/travel-authorizations", () => {
      test("when authorized and travel authorization creation is successful", async () => {
        // Arrange
        const newTravelAuthorizationAttributes = {
          ...travelAuthorizationFactory.attributesFor({
            userId: user.id,
            wizardStepName: "edit-purpose-details",
            status: TravelAuthorization.Statuses.DRAFT,
          }),
          travelSegmentEstimatesAttributes: [
            {
              isActual: false,
              segmentNumber: 1,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
              accommodationType: TravelSegment.AccommodationTypes.HOTEL,
            },
            {
              isActual: false,
              segmentNumber: 2,
              modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
              accommodationType: null,
            },
          ],
        }

        // Act
        const response = await request()
          .post("/api/travel-authorizations")
          .send(newTravelAuthorizationAttributes)

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelAuthorization: expect.objectContaining({
            userId: user.id,
            wizardStepName: "edit-purpose-details",
            travelSegments: expect.arrayContaining([
              expect.objectContaining({
                isActual: false,
                segmentNumber: 1,
                modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
                accommodationType: TravelSegment.AccommodationTypes.HOTEL,
              }),
              expect.objectContaining({
                isActual: false,
                segmentNumber: 2,
                modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
                accommodationType: null,
              }),
            ]),
          }),
        })
      })
    })
  })
})
