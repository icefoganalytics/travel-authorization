import {
  TravelAuthorization,
  TravelDeskOtherTransportation,
  TravelDeskTravelRequest,
  User,
} from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-other-transportations-controller.ts", () => {
  describe("TravelDeskOtherTransportationsController", () => {
    describe("#update", () => {
      test("when other transportation is updated, it returns its response fields without its policy graph", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create({ status: TravelAuthorization.Statuses.APPROVED })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        const travelDeskOtherTransportation1 = await TravelDeskOtherTransportation.create({
          travelRequestId: travelDeskTravelRequest1.id,
          depart: "Whitehorse",
          arrive: "Dawson City",
          transportationType: TravelDeskOtherTransportation.TransportationTypes.BUS,
          date: "2026-11-10",
          additionalNotes: "Morning departure",
          status: TravelDeskOtherTransportation.Statuses.REQUESTED,
          reservedTransportationInfo: null,
          booking: null,
        })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-other-transportations/${travelDeskOtherTransportation1.id}`)
          .send({ additionalNotes: "Morning departure; confirm pickup location" })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskOtherTransportation: {
            id: travelDeskOtherTransportation1.id,
            travelRequestId: travelDeskTravelRequest1.id,
            depart: "Whitehorse",
            arrive: "Dawson City",
            transportationType: TravelDeskOtherTransportation.TransportationTypes.BUS,
            date: "2026-11-10",
            additionalNotes: "Morning departure; confirm pickup location",
            status: TravelDeskOtherTransportation.Statuses.REQUESTED,
            reservedTransportationInfo: null,
            booking: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          policy: {
            show: true,
            create: true,
            update: true,
            destroy: true,
          },
        })
      })

      test("when another traveller updates other transportation, it rejects the update", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const user2 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user2 })
          .create({ status: TravelAuthorization.Statuses.APPROVED })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        const travelDeskOtherTransportation1 = await TravelDeskOtherTransportation.create({
          travelRequestId: travelDeskTravelRequest1.id,
          depart: "Whitehorse",
          arrive: "Dawson City",
          transportationType: TravelDeskOtherTransportation.TransportationTypes.BUS,
          date: "2026-11-10",
          status: TravelDeskOtherTransportation.Statuses.REQUESTED,
        })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-other-transportations/${travelDeskOtherTransportation1.id}`)
          .send({ additionalNotes: "Confirm pickup location" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this other transportation.",
        })
      })
    })
  })
})
