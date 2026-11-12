import { TravelAuthorization } from "@/models"
import SubmitService from "@/services/travel-authorizations/submit-service"

import { travelAuthorizationFactory, travelSegmentFactory, userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/submit-service.ts", () => {
  describe("SubmitService", () => {
    describe("#perform", () => {
      test("when an estimated multi-city choice is missing, it rejects submission", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).createList(2)
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isActual: true, isPrimaryDestination: true })

        // Act
        const result = SubmitService.perform(
          travelAuthorization,
          { supervisorEmail: supervisor.email },
          currentUser
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Select a primary destination for the multi-city itinerary before submitting."
        )
      })

      test("when missing selection rejects submission, it leaves the authorization in draft", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).createList(2)

        // Act
        await SubmitService.perform(
          travelAuthorization,
          { supervisorEmail: supervisor.email },
          currentUser
        ).catch(() => undefined)

        // Assert
        expect((await travelAuthorization.reload()).status).toEqual(
          TravelAuthorization.Statuses.DRAFT
        )
      })

      test("when an estimated multi-city arrival is selected, it submits without requiring actual confirmation", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const supervisor = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
        })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ isPrimaryDestination: true, segmentNumber: 1 })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({ segmentNumber: 2 })

        // Act
        const result = await SubmitService.perform(
          travelAuthorization,
          { supervisorEmail: supervisor.email },
          currentUser
        )

        // Assert
        expect(result.status).toEqual(TravelAuthorization.Statuses.SUBMITTED)
      })
    })
  })
})
