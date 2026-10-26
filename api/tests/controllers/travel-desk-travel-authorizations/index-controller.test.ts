import { TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"

import {
  locationFactory,
  stopFactory,
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  travelPurposeFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-travel-authorizations/index-controller.ts", () => {
  describe("IndexController", () => {
    describe("#index - GET /api/travel-desk/travel-authorizations", () => {
      test("when a department administrator opens the list, it shows only their own authorizations", async () => {
        // Arrange
        const departmentAdmin = await userFactory.create({
          roles: [User.Roles.DEPARTMENT_ADMIN],
          department: "Finance",
        })
        const traveller = await userFactory.create({ roles: [User.Roles.USER] })
        await travelAuthorizationFactory.create({
          userId: traveller.id,
          department: "Finance",
        })
        const ownTravelAuthorization = await travelAuthorizationFactory.create({
          userId: departmentAdmin.id,
          department: "Operations",
        })
        mockCurrentUser(departmentAdmin)

        // Act
        const response = await request().get("/api/travel-desk/travel-authorizations")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizations: [expect.objectContaining({ id: ownTravelAuthorization.id })],
          totalCount: 1,
        })
      })

      test("when a regular user filters for another owner, it cannot widen visibility", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const otherUser = await userFactory.create({ roles: [User.Roles.USER] })
        await travelAuthorizationFactory.create({ userId: user.id })
        await travelAuthorizationFactory.create({ userId: otherUser.id })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .get("/api/travel-desk/travel-authorizations")
          .query({ where: { userId: otherUser.id } })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizations: [],
          totalCount: 0,
        })
      })

      test("when travel authorizations include modern segments or historic stops, it serializes dates and the persisted travel desk request", async () => {
        // Arrange
        const administrator = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const traveller = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const purpose = await travelPurposeFactory.create({
          purpose: "Regional planning meeting",
        })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            purpose,
            user: traveller,
          })
          .create({
            department: "Finance",
            firstName: "Ada",
            lastName: "Lovelace",
            status: TravelAuthorization.Statuses.APPROVED,
          })
        const otherTravelAuthorization = await travelAuthorizationFactory
          .associations({ user: traveller })
          .create()
        await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: otherTravelAuthorization })
          .create()
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({
            invoiceNumber: "INV-426",
            status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
          })
        const whitehorse = await locationFactory.create({
          city: "Whitehorse",
          province: "Yukon",
        })
        const dawsonCity = await locationFactory.create({
          city: "Dawson City",
          province: "Yukon",
        })
        const mayo = await locationFactory.create({
          city: "Mayo",
          province: "Yukon",
        })
        await travelSegmentFactory
          .associations({
            travelAuthorization,
            departureLocation: whitehorse,
            arrivalLocation: dawsonCity,
          })
          .create({
            departureOn: "2026-02-03",
            departureTime: "08:30:00",
            segmentNumber: 1,
          })
        await travelSegmentFactory
          .associations({
            travelAuthorization,
            departureLocation: dawsonCity,
            arrivalLocation: mayo,
          })
          .create({
            departureOn: "2026-02-10",
            departureTime: "09:00:00",
            segmentNumber: 2,
          })

        const historicalTravelAuthorization = await travelAuthorizationFactory
          .associations({ user: traveller })
          .create()
        const historicalLocation = await locationFactory.create({
          city: "Faro",
          province: "Yukon",
        })
        await stopFactory
          .associations({
            travelAuthorization: historicalTravelAuthorization,
            location: historicalLocation,
          })
          .create({
            departureDate: "2020-03-04",
            departureTime: "07:15:00",
          })
        mockCurrentUser(administrator)

        // Act
        const response = await request().get("/api/travel-desk/travel-authorizations")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            totalCount: 3,
            travelAuthorizations: expect.arrayContaining([
              expect.objectContaining({
                id: travelAuthorization.id,
                firstName: "Ada",
                lastName: "Lovelace",
                status: TravelAuthorization.Statuses.APPROVED,
                purposeText: "Regional planning meeting",
                departingAt: new Date("2026-02-03T08:30:00").toISOString(),
                returningAt: new Date("2026-02-10T09:00:00").toISOString(),
                locationIds: [whitehorse.id, dawsonCity.id, mayo.id],
                travelDeskTravelRequest: {
                  id: travelDeskTravelRequest.id,
                  status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
                  invoiceNumber: "INV-426",
                },
              }),
              expect.objectContaining({
                id: historicalTravelAuthorization.id,
                departingAt: new Date("2020-03-04T07:15:00").toISOString(),
                returningAt: new Date("2020-03-04T07:15:00").toISOString(),
                locationIds: [historicalLocation.id],
                travelDeskTravelRequest: null,
              }),
            ]),
          })
        )
      })
    })
  })
})
