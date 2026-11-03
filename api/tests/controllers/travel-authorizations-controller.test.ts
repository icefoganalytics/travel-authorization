import { TravelAuthorization, TravelDeskTravelRequest, TravelSegment, User } from "@/models"
import {
  expenseFactory,
  locationFactory,
  stopFactory,
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

      test("when an authorization has a request and connecting segments, it includes the persisted request identity and unique locations", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({
            user: user1,
          })
          .create()
        const travelAuthorization2 = await travelAuthorizationFactory
          .associations({
            user: user1,
          })
          .create()
        await travelDeskTravelRequestFactory
          .associations({
            travelAuthorization: travelAuthorization2,
          })
          .create()
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({
            travelAuthorization: travelAuthorization1,
          })
          .create({
            status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
            invoiceNumber: "INV-426",
          })
        const location1 = await locationFactory.create()
        const location2 = await locationFactory.create()
        await travelSegmentFactory
          .associations({
            travelAuthorization: travelAuthorization1,
            departureLocation: location1,
            arrivalLocation: location2,
          })
          .create({
            segmentNumber: 1,
          })
        await travelSegmentFactory
          .associations({
            travelAuthorization: travelAuthorization1,
            departureLocation: location2,
            arrivalLocation: location1,
          })
          .create({
            segmentNumber: 2,
          })

        // Act
        const response = await request()
          .get("/api/travel-authorizations")
          .query({
            where: {
              id: travelAuthorization1.id,
            },
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          totalCount: 1,
          travelAuthorizations: [
            expect.objectContaining({
              id: travelAuthorization1.id,
              locationIds: [location1.id, location2.id],
              travelDeskTravelRequest: {
                id: travelDeskTravelRequest1.id,
                status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
                invoiceNumber: "INV-426",
              },
            }),
          ],
        })
      })

      test("when an authorization predates travel segments, it retains its stop dates and locations", async () => {
        // Arrange
        const user1 = await userFactory.create({
          roles: [User.Roles.USER],
        })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({
            user: user1,
          })
          .create()
        const location1 = await locationFactory.create()
        await stopFactory
          .associations({
            travelAuthorization: travelAuthorization1,
            location: location1,
          })
          .create({
            departureDate: "2020-03-04",
            departureTime: "07:15:00",
          })

        // Act
        const response = await request().get("/api/travel-authorizations")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          totalCount: 1,
          travelAuthorizations: [
            expect.objectContaining({
              id: travelAuthorization1.id,
              departingAt: new Date("2020-03-04T07:15:00").toISOString(),
              returningAt: new Date("2020-03-04T07:15:00").toISOString(),
              locationIds: [location1.id],
              travelDeskTravelRequest: null,
            }),
          ],
        })
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
