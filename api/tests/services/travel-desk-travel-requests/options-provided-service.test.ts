import {
  TravelAuthorization,
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskTravelRequest,
  TravelSegment,
} from "@/models"

import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

import OptionsProvidedService from "@/services/travel-desk-travel-requests/options-provided-service"

describe("api/src/services/travel-desk-travel-requests/options-provided-service.ts", () => {
  describe("OptionsProvidedService", () => {
    describe(".perform", () => {
      test("when no flight requests exist, it marks the request as options provided", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_FLIGHT_OPTIONS,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({
            travelAuthorization,
          })
          .create({
            status: TravelDeskTravelRequest.Statuses.SUBMITTED,
          })

        // Act
        const updatedTravelDeskTravelRequest = await OptionsProvidedService.perform(
          travelDeskTravelRequest,
          {},
          currentUser
        )

        // Assert
        expect(updatedTravelDeskTravelRequest).toEqual(
          expect.objectContaining({
            id: travelDeskTravelRequest.id,
            status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
            travelAuthorization: expect.objectContaining({
              id: travelAuthorization.id,
              wizardStepName: TravelAuthorization.WizardStepNames.RANK_FLIGHT_OPTIONS,
            }),
          })
        )
      })

      test("when any flight request is missing flight options, it errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_FLIGHT_OPTIONS,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({
            travelAuthorization,
          })
          .create({
            status: TravelDeskTravelRequest.Statuses.SUBMITTED,
          })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        })
        const travelDeskFlightRequest1 = await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-03-27",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
        })
        await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Vancouver",
          arriveLocation: "Victoria",
          datePreference: "2026-03-28",
          timePreference: TravelDeskFlightRequest.TimePreferences.PM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
        })
        await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest1.id,
          travelerId: travelAuthorization.userId,
          cost: "500.00",
          leg: "Whitehorse -> Vancouver @ Mar 27, 2026",
          duration: "2h 30m",
        })

        // Assert
        await expect(
          // Act
          OptionsProvidedService.perform(travelDeskTravelRequest, {}, currentUser)
        ).rejects.toThrowError(
          "Travel desk travel request must have at least one flight option for each flight request before sending options to the traveler."
        )
      })

      test("when every flight request has at least one flight option, it marks the request as options provided", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          wizardStepName: TravelAuthorization.WizardStepNames.AWAITING_FLIGHT_OPTIONS,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory
          .associations({
            travelAuthorization,
          })
          .create({
            status: TravelDeskTravelRequest.Statuses.SUBMITTED,
          })
        await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
        })
        const travelDeskFlightRequest = await TravelDeskFlightRequest.create({
          travelRequestId: travelDeskTravelRequest.id,
          departLocation: "Whitehorse",
          arriveLocation: "Vancouver",
          datePreference: "2026-03-27",
          timePreference: TravelDeskFlightRequest.TimePreferences.AM,
          seatPreference: TravelDeskFlightRequest.SeatPreferencesTypes.NO_PREFERENCE,
        })
        await TravelDeskFlightOption.create({
          flightRequestId: travelDeskFlightRequest.id,
          travelerId: travelAuthorization.userId,
          cost: "500.00",
          leg: "Whitehorse -> Vancouver @ Mar 27, 2026",
          duration: "2h 30m",
        })

        // Act
        const updatedTravelDeskTravelRequest = await OptionsProvidedService.perform(
          travelDeskTravelRequest,
          {},
          currentUser
        )

        // Assert
        expect(updatedTravelDeskTravelRequest).toEqual(
          expect.objectContaining({
            id: travelDeskTravelRequest.id,
            status: TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED,
            travelAuthorization: expect.objectContaining({
              id: travelAuthorization.id,
              wizardStepName: TravelAuthorization.WizardStepNames.RANK_FLIGHT_OPTIONS,
            }),
          })
        )
      })
    })
  })
})
