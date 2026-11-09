import { TravelAuthorization, TravelDeskTravelRequest, TravelSegment, User } from "@/models"

import {
  expenseFactory,
  locationFactory,
  stopFactory,
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  travelPurposeFactory,
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
              locations: [
                expect.objectContaining({
                  id: location1.id,
                  city: location1.city,
                  province: location1.province,
                }),
                expect.objectContaining({
                  id: location2.id,
                  city: location2.city,
                  province: location2.province,
                }),
              ],
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
              locations: [
                expect.objectContaining({
                  id: location1.id,
                  city: location1.city,
                  province: location1.province,
                }),
              ],
              travelDeskTravelRequest: null,
            }),
          ],
        })
      })

      test.each([
        { field: "travelerName", direction: "ASC", positions: [1, 2] },
        { field: "travelerName", direction: "DESC", positions: [0, 1] },
        { field: "purposeText", direction: "ASC", positions: [1, 2] },
        { field: "purposeText", direction: "DESC", positions: [0, 1] },
        { field: "travelDeskStatus", direction: "ASC", positions: [1, 0] },
        { field: "travelDeskStatus", direction: "DESC", positions: [2, 0] },
        { field: "travelerName", direction: "ASC", positions: [2], page: 2, perPage: 1 },
      ])(
        "when sorting $field $direction, it orders authorized rows before limiting with stable ties",
        async ({ field, direction, positions, page = 1, perPage = 2 }) => {
          // Arrange
          const user = await userFactory.create({ roles: [User.Roles.USER] })
          mockCurrentUser(user)
          const travelAuthorizations: TravelAuthorization[] = []
          for (const firstName of ["Zulu", "Alpha", "Alpha"]) {
            const traveller = await userFactory.create({ firstName, lastName: "Traveller" })
            const purpose = await travelPurposeFactory.create({ purpose: firstName })
            const travelAuthorization = travelAuthorizationFactory.build({
              userId: traveller.id,
              purposeId: purpose.id,
              supervisorEmail: user.email,
              updatedAt: new Date("2020-01-01T00:00:00Z"),
            })
            await travelAuthorization.save({ silent: true })
            travelAuthorizations.push(travelAuthorization)
          }
          await travelDeskTravelRequestFactory.create({
            travelAuthorizationId: travelAuthorizations[0].id,
            status: TravelDeskTravelRequest.Statuses.SUBMITTED,
          })
          await travelDeskTravelRequestFactory.create({
            travelAuthorizationId: travelAuthorizations[1].id,
            status: TravelDeskTravelRequest.Statuses.DRAFT,
          })
          await travelAuthorizationFactory.create()

          // Act
          const response = await request().get("/api/travel-authorizations").query({
            "order[0][0]": field,
            "order[0][1]": direction,
            page,
            perPage,
          })

          // Assert
          expect(response.status).toEqual(200)
          expect(response.body).toEqual({
            totalCount: 3,
            travelAuthorizations: positions.map((position) =>
              expect.objectContaining({ id: travelAuthorizations[position].id })
            ),
          })
        }
      )

      test.each([
        { field: "departingAt", direction: "ASC", position: 0, date: "2020-02-01T00:00:00" },
        { field: "departingAt", direction: "DESC", position: 2, date: "2020-04-01T00:00:00" },
        { field: "returningAt", direction: "ASC", position: 2, date: "2020-05-01T00:00:00" },
        { field: "returningAt", direction: "DESC", position: 1, date: "2020-07-15T00:00:00" },
      ])(
        "when sorting $field $direction, it uses boundary segments and stop fallback before pagination",
        async ({ field, direction, position, date }) => {
          // Arrange
          const user = await userFactory.create({ roles: [User.Roles.USER] })
          mockCurrentUser(user)
          const travellerAuthorizationFactory = travelAuthorizationFactory.associations({ user })
          const travelAuthorizations: TravelAuthorization[] = []
          for (let index = 0; index < 3; index++) {
            travelAuthorizations.push(await travellerAuthorizationFactory.create())
          }
          for (const [index, travelAuthorization] of travelAuthorizations.entries()) {
            await stopFactory.create({
              travelAuthorizationId: travelAuthorization.id,
              departureDate: `2020-0${index + 2}-01`,
              departureTime: null,
            })
            await stopFactory.create({
              travelAuthorizationId: travelAuthorization.id,
              departureDate: `2020-0${7 - index}-01`,
              departureTime: null,
            })
          }
          // Boundary dates are null: do not silently choose the interior dated segment.
          await travelSegmentFactory.create({
            travelAuthorizationId: travelAuthorizations[0].id,
            segmentNumber: 1,
            departureOn: null,
          })
          await travelSegmentFactory.create({
            travelAuthorizationId: travelAuthorizations[0].id,
            segmentNumber: 2,
            departureOn: "2020-01-01",
          })
          await travelSegmentFactory.create({
            travelAuthorizationId: travelAuthorizations[0].id,
            segmentNumber: 3,
            departureOn: null,
          })
          await travelSegmentFactory.create({
            travelAuthorizationId: travelAuthorizations[1].id,
            segmentNumber: 1,
            departureOn: "2020-02-15",
            departureTime: null,
          })
          await travelSegmentFactory.create({
            travelAuthorizationId: travelAuthorizations[1].id,
            segmentNumber: 2,
            departureOn: "2020-07-15",
            departureTime: null,
          })

          // Act
          const response = await request().get("/api/travel-authorizations").query({
            "order[0][0]": field,
            "order[0][1]": direction,
            perPage: 1,
          })

          // Assert
          expect(response.status).toEqual(200)
          expect(response.body).toEqual({
            totalCount: 3,
            travelAuthorizations: [
              expect.objectContaining({
                id: travelAuthorizations[position].id,
                [field]: new Date(date).toISOString(),
              }),
            ],
          })
        }
      )
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
