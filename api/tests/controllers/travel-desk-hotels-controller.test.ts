import { TravelAuthorization, TravelDeskHotel, TravelDeskTravelRequest, User } from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskHotelFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-hotels-controller.ts", () => {
  describe("TravelDeskHotelsController", () => {
    describe("#update", () => {
      test("when a hotel is updated, it returns the hotel response fields without its policy graph", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user1)
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create({ status: TravelAuthorization.Statuses.APPROVED })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.DRAFT })
        const travelDeskHotel1 = await travelDeskHotelFactory
          .associations({ travelRequest: travelDeskTravelRequest1 })
          .create({
            city: "Whitehorse",
            isDedicatedConferenceHotelAvailable: false,
            conferenceName: null,
            conferenceHotelName: null,
            checkIn: "2026-11-10",
            checkOut: "2026-11-12",
            additionalInformation: "Near the airport",
            status: TravelDeskHotel.Statuses.REQUESTED,
            reservedHotelInfo: null,
            booking: null,
          })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-hotels/${travelDeskHotel1.id}`)
          .send({ additionalInformation: "Prefer a quiet room" })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskHotel: {
            id: travelDeskHotel1.id,
            travelRequestId: travelDeskTravelRequest1.id,
            city: "Whitehorse",
            isDedicatedConferenceHotelAvailable: false,
            conferenceName: null,
            conferenceHotelName: null,
            checkIn: "2026-11-10",
            checkOut: "2026-11-12",
            additionalInformation: "Prefer a quiet room",
            status: TravelDeskHotel.Statuses.REQUESTED,
            reservedHotelInfo: null,
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

      test("when another traveller updates a hotel, it rejects the update", async () => {
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
        const travelDeskHotel1 = await travelDeskHotelFactory
          .associations({ travelRequest: travelDeskTravelRequest1 })
          .create({
            city: "Whitehorse",
            isDedicatedConferenceHotelAvailable: false,
            checkIn: "2026-11-10",
            checkOut: "2026-11-12",
            status: TravelDeskHotel.Statuses.REQUESTED,
          })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-hotels/${travelDeskHotel1.id}`)
          .send({ additionalInformation: "Prefer a quiet room" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel desk hotel.",
        })
      })
    })
  })
})
