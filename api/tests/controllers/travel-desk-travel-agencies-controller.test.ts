import { TravelDeskTravelAgency, User } from "@/models"

import { userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-travel-agencies-controller.ts", () => {
  describe("TravelDeskTravelAgenciesController", () => {
    describe("#update", () => {
      test("when a travel desk user updates an agency, it returns the agency response fields", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        mockCurrentUser(user1)
        const travelDeskTravelAgency1 = await TravelDeskTravelAgency.create({
          agencyName: "Northern Travel",
          contactName: "Morgan Lee",
          contactEmail: "morgan@example.com",
          contactPhoneNumber: "867-555-0134",
          agencyInfo: "Main office",
        })

        // Act
        const response = await request()
          .patch(`/api/travel-desk-travel-agencies/${travelDeskTravelAgency1.id}`)
          .send({ agencyInfo: "Main office; after-hours support available" })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskTravelAgency: {
            id: travelDeskTravelAgency1.id,
            agencyName: "Northern Travel",
            contactName: "Morgan Lee",
            contactEmail: "morgan@example.com",
            contactPhoneNumber: "867-555-0134",
            agencyInfo: "Main office; after-hours support available",
          },
        })
      })
    })
  })
})
