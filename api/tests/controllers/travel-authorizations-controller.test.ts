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
  describe("TravelAuthorizationsController", () => {
    describe("#index - GET /api/travel-authorizations", () => {
      test("when travel desk travel request is null, returns 200 and serializes without error", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user)

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
      test("when status is omitted, it creates a draft with the submitted estimated trip segments", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user)

        const newTravelAuthorizationAttributes = {
          userId: user.id,
          eventName: "Travel planning meeting",
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
            eventName: "Travel planning meeting",
            status: TravelAuthorization.Statuses.DRAFT,
            wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
            travelSegments: [
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
            ],
          }),
        })
      })

      test("when workflow state is supplied, it still creates a draft with the submitted details", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user)

        const newTravelAuthorizationAttributes = {
          userId: user.id,
          eventName: "One-way site visit",
          tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
          status: TravelAuthorization.Statuses.EXPENSED,
          wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
          travelSegmentEstimatesAttributes: [
            {
              isActual: false,
              segmentNumber: 1,
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
            eventName: "One-way site visit",
            tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
            status: TravelAuthorization.Statuses.DRAFT,
            wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
            travelSegments: [
              expect.objectContaining({
                isActual: false,
                segmentNumber: 1,
                modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
                accommodationType: null,
              }),
            ],
          }),
        })
      })

      test("when an administrator supplies null status and traveller attributes, it creates an initialized draft", async () => {
        // Arrange
        const traveller = await userFactory.create({
          email: "selected-traveller@example.com",
        })
        const admin = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        mockCurrentUser(admin)

        const newTravelAuthorizationAttributes = {
          userAttributes: {
            email: traveller.email,
          },
          status: null,
          eventName: "Managed travel request",
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
            userId: traveller.id,
            createdBy: admin.id,
            eventName: "Managed travel request",
            status: TravelAuthorization.Statuses.DRAFT,
            wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
            travelSegments: [
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
            ],
          }),
        })
      })
    })
  })
})
