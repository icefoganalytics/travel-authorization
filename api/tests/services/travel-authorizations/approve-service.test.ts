import { TravelAuthorization, TravelSegment } from "@/models"
import { ApproveService } from "@/services/travel-authorizations"
import { TravelDeskTravelRequests } from "@/services"
import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  travelPurposeFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

vi.mock("@/services/travel-desk-travel-requests", () => ({
  CreateService: {
    perform: vi.fn(),
  },
}))

describe("api/src/services/travel-authorizations/approve-service.ts", () => {
  describe("ApproveService#perform", () => {
    test("when travel authorization is in a submitted state, it updates the status to approved", async () => {
      // Arrange
      const approver = await userFactory.create()
      const user = await userFactory.create()
      const travelSegments = travelSegmentFactory.buildList(3)
      const purpose = await travelPurposeFactory.create()
      const travelAuthorization = await travelAuthorizationFactory
        .associations({
          purpose,
          travelSegments,
          user,
        })
        .create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

      // Act
      const updatedTravelAuthorization = await ApproveService.perform(travelAuthorization, approver)

      // Assert
      expect(updatedTravelAuthorization).toEqual(
        expect.objectContaining({
          id: travelAuthorization.id,
          status: TravelAuthorization.Statuses.APPROVED,
        })
      )
    })

    test("when travel authorization is not in a submitted state, it errors informatively", async () => {
      // Arrange
      const approver = await userFactory.create()
      const user = await userFactory.create()
      const travelSegments = travelSegmentFactory.buildList(3)
      const purpose = await travelPurposeFactory.create()
      const travelAuthorization = await travelAuthorizationFactory
        .associations({
          purpose,
          travelSegments,
          user,
        })
        .create({
          status: TravelAuthorization.Statuses.APPROVED,
        })

      expect.assertions(1)
      try {
        // Act
        await ApproveService.perform(travelAuthorization, approver)
      } catch (error) {
        // Assert
        expect(error).toEqual(
          new Error("Travel authorization must be in submitted state to approve.")
        )
      }
    })

    test("when travel is by air, it calls the travel desk travel requests create services", async () => {
      // Arrange
      const approver = await userFactory.create()
      const user = await userFactory.create()
      const travelSegments = travelSegmentFactory.buildList(3, {
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
      })
      const purpose = await travelPurposeFactory.create()
      const travelAuthorization = await travelAuthorizationFactory
        .associations({
          purpose,
          travelSegments,
          user,
        })
        .create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })
      const createServicePerformSpy = vi.spyOn(TravelDeskTravelRequests.CreateService, "perform")

      // Act
      await ApproveService.perform(travelAuthorization, approver)

      // Assert
      expect(createServicePerformSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          travelAuthorizationId: travelAuthorization.id,
          legalFirstName: user.firstName,
          legalLastName: user.lastName,
          strAddress: "",
          city: "",
          province: "",
          postalCode: "",
          busPhone: "",
          busEmail: user.email,
          travelPurpose: purpose.purpose,
        }),
        expect.objectContaining({
          id: approver.id,
        })
      )
    })

    test("when travel is not by air, it does not call the travel desk travel requests create services", async () => {
      // Arrange
      const approver = await userFactory.create()
      const user = await userFactory.create()
      const travelSegments = travelSegmentFactory.buildList(3, {
        modeOfTransport: TravelSegment.TravelMethods.PERSONAL_VEHICLE,
      })
      const purpose = await travelPurposeFactory.create()
      const travelAuthorization = await travelAuthorizationFactory
        .associations({
          purpose,
          travelSegments,
          user,
        })
        .create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })
      const createServicePerformSpy = vi.spyOn(TravelDeskTravelRequests.CreateService, "perform")

      // Act
      await ApproveService.perform(travelAuthorization, approver)

      // Assert
      expect(createServicePerformSpy).not.toHaveBeenCalled()
    })

    test("when travelling by air, and previous travel desk travel request exists for user, it passes the previous travel desk travel request data to create new one", async () => {
      // Arrange
      const approver = await userFactory.create()
      const user = await userFactory.create()
      const travelSegments = travelSegmentFactory.buildList(3, {
        modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
      })
      const purpose = await travelPurposeFactory.create()
      const travelAuthorization = await travelAuthorizationFactory
        .associations({
          purpose,
          travelSegments,
          user,
        })
        .create({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

      const previousTravelAuthorizationForUser = await travelAuthorizationFactory
        .associations({
          purpose,
          travelSegments,
          user,
        })
        .create({
          status: TravelAuthorization.Statuses.EXPENSED,
        })
      const previousTravelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
        travelAuthorizationId: previousTravelAuthorizationForUser.id,
        birthDate: "1990-01-01",
        strAddress: "1487 Brycen Forks",
        city: "Beierchester",
        province: "Colorado",
        postalCode: "49424",
        busPhone: "1-243-312-1143 x454",
      })

      const createServicePerformSpy = vi.spyOn(TravelDeskTravelRequests.CreateService, "perform")

      // Act
      await ApproveService.perform(travelAuthorization, approver)

      // Assert
      expect(createServicePerformSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          travelAuthorizationId: travelAuthorization.id,
          legalFirstName: user.firstName,
          legalLastName: user.lastName,
          birthDate: previousTravelDeskTravelRequest.birthDate,
          strAddress: previousTravelDeskTravelRequest.strAddress,
          city: previousTravelDeskTravelRequest.city,
          province: previousTravelDeskTravelRequest.province,
          postalCode: previousTravelDeskTravelRequest.postalCode,
          busPhone: previousTravelDeskTravelRequest.busPhone,
          busEmail: user.email,
          travelPurpose: purpose.purpose,
        }),
        expect.objectContaining({
          id: approver.id,
        })
      )
    })
  })
})
