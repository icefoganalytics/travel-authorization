import { TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-travel-requests/options-provided-controller.ts", () => {
  describe("OptionsProvidedController", () => {
    describe("#create", () => {
      test("when the action succeeds, it returns the request show contract and its document flag", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user })
          .create({ status: TravelAuthorization.Statuses.APPROVED })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.SUBMITTED })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelDeskTravelRequest.id}/options-provided`)
          .send({})

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskTravelRequest: {
            id: travelDeskTravelRequest.id,
            travelAuthorizationId: travelDeskTravelRequest.travelAuthorizationId,
            travelAgencyId: travelDeskTravelRequest.travelAgencyId,
            invoiceNumber: travelDeskTravelRequest.invoiceNumber,
            legalFirstName: travelDeskTravelRequest.legalFirstName,
            legalLastName: travelDeskTravelRequest.legalLastName,
            strAddress: travelDeskTravelRequest.strAddress,
            city: travelDeskTravelRequest.city,
            province: travelDeskTravelRequest.province,
            postalCode: travelDeskTravelRequest.postalCode,
            legalMiddleName: travelDeskTravelRequest.legalMiddleName,
            travelPurpose: travelDeskTravelRequest.travelPurpose,
            busPhone: travelDeskTravelRequest.busPhone,
            busEmail: travelDeskTravelRequest.busEmail,
            birthDate: travelDeskTravelRequest.birthDate,
            isInternationalTravel: travelDeskTravelRequest.isInternationalTravel,
            passportCountry: travelDeskTravelRequest.passportCountry,
            passportNum: travelDeskTravelRequest.passportNum,
            travelLocation: travelDeskTravelRequest.travelLocation,
            travelNotes: travelDeskTravelRequest.travelNotes,
            travelContact: travelDeskTravelRequest.travelContact,
            travelPhone: travelDeskTravelRequest.travelPhone,
            travelEmail: travelDeskTravelRequest.travelEmail,
            additionalInformation: travelDeskTravelRequest.additionalInformation,
            travelDeskOfficer: travelDeskTravelRequest.travelDeskOfficer,
            status: "options_provided",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            hasPassengerNameRecordDocument: false,
          },
        })
      })

      test("when the request does not exist, it returns not found", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post("/api/travel-desk-travel-requests/999999/options-provided")
          .send({})

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({ message: "Travel desk request not found." })
      })

      test("when a traveller tries to provide options, it denies the action", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        const travelAuthorization1 = await travelAuthorizationFactory
          .associations({ user: user1 })
          .create({
            status: TravelAuthorization.Statuses.APPROVED,
            supervisorEmail: `not-${user1.email}`,
          })
        const travelDeskTravelRequest1 = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization: travelAuthorization1 })
          .create({ status: TravelDeskTravelRequest.Statuses.SUBMITTED })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelDeskTravelRequest1.id}/options-provided`)
          .send({})

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to provide options for this travel desk request.",
        })
      })
    })
  })
})
