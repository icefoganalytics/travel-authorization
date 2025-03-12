import { Stop, User } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

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
    describe("#create - POST /api/travel-authorizations", () => {
      test("when authorized and travel authorization creation is successful", async () => {
        // Arrange
        const newTravelAuthorizationAttributes = {
          ...travelAuthorizationFactory.attributesFor({
            userId: user.id,
            wizardStepName: "edit-purpose-details",
          }),
          stopsAttributes: [
            {
              accommodationType: Stop.AccommodationTypes.HOTEL,
              transport: Stop.TravelMethods.AIRCRAFT,
            },
            {
              transport: Stop.TravelMethods.AIRCRAFT,
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
            stops: expect.arrayContaining([
              expect.objectContaining({
                accommodationType: "Hotel",
                transport: "Aircraft",
              }),
              expect.objectContaining({
                transport: "Aircraft",
                accommodationType: null,
              }),
            ]),
          }),
        })
      })
    })
  })
})
