import { Attachment, TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-travel-requests/options-ranked-controller.ts", () => {
  describe("OptionsRankedController", () => {
    describe("#create", () => {
      test("when the action succeeds, it returns the request show contract and its document flag", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user })
          .create({ status: TravelAuthorization.Statuses.APPROVED })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({ travelAuthorization })
          .create({ status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED })
        await Attachment.create({
          targetId: travelDeskTravelRequest.id,
          targetType: Attachment.TargetTypes.TravelDeskTravelRequest,
          name: "passenger-name-record.pdf",
          size: 1,
          content: Buffer.from("x"),
          mimeType: "application/pdf",
        })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post(`/api/travel-desk-travel-requests/${travelDeskTravelRequest.id}/options-ranked`)
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
            status: "options_ranked",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            hasPassengerNameRecordDocument: true,
          },
        })
      })

      test("when the request does not exist, it returns not found", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(user)

        // Act
        const response = await request()
          .post("/api/travel-desk-travel-requests/999999/options-ranked")
          .send({})

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({ message: "Travel desk request not found." })
      })
    })
  })
})
