import { TravelAuthorization } from "@/models"
import UpdateService from "@/services/travel-authorizations/wizard/update-service"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/travel-authorizations/wizard/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
      test.each([
        {
          phase: "estimated",
          status: TravelAuthorization.Statuses.DRAFT,
          currentStep: TravelAuthorization.WizardStepNames.EDIT_TRIP_DETAILS,
          nextStep: TravelAuthorization.WizardStepNames.GENERATE_ESTIMATE,
        },
        {
          phase: "actual",
          status: TravelAuthorization.Statuses.APPROVED,
          currentStep: TravelAuthorization.WizardStepNames.CONFIRM_ACTUAL_TRAVEL_DETAILS,
          nextStep: TravelAuthorization.WizardStepNames.SUBMIT_EXPENSES,
        },
      ])("when $phase trip details have no destination, it refuses to advance", async ({
        status,
        currentStep,
        nextStep,
      }) => {
        // Arrange
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status,
          userId: traveller.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          wizardStepName: currentStep,
        })

        // Act
        const result = UpdateService.perform(
          travelAuthorization,
          { wizardStepName: nextStep },
          traveller
        )

        // Assert
        await expect(result).rejects.toThrow(
          "Select a primary destination for the multi-city itinerary before continuing."
        )
      })

      test("when missing destination rejects advancement, it preserves the saved wizard step", async () => {
        // Arrange
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
          userId: traveller.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          wizardStepName: TravelAuthorization.WizardStepNames.EDIT_TRIP_DETAILS,
        })

        // Act
        await UpdateService.perform(
          travelAuthorization,
          { wizardStepName: TravelAuthorization.WizardStepNames.GENERATE_ESTIMATE },
          traveller
        ).catch(() => undefined)

        // Assert
        expect((await travelAuthorization.reload()).wizardStepName).toEqual(
          TravelAuthorization.WizardStepNames.EDIT_TRIP_DETAILS
        )
      })

      test.each([
        {
          phase: "estimated",
          isActual: false,
          status: TravelAuthorization.Statuses.DRAFT,
          destinationAttribute: "estimatedPrimaryDestinationId",
          nextStep: TravelAuthorization.WizardStepNames.GENERATE_ESTIMATE,
        },
        {
          phase: "actual",
          isActual: true,
          status: TravelAuthorization.Statuses.APPROVED,
          destinationAttribute: "actualPrimaryDestinationId",
          nextStep: TravelAuthorization.WizardStepNames.SUBMIT_EXPENSES,
        },
      ])("when $phase trip details have a matching city, it advances", async ({
        isActual,
        status,
        destinationAttribute,
        nextStep,
      }) => {
        // Arrange
        const traveller = await userFactory.create()
        const location = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status,
          userId: traveller.id,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          tripTypeActual: TravelAuthorization.TripTypes.MULTI_CITY,
          [destinationAttribute]: location.id,
        })
        await travelSegmentFactory.associations({ travelAuthorization }).create({
          isActual,
          arrivalLocationId: location.id,
        })

        // Act
        const result = await UpdateService.perform(
          travelAuthorization,
          { wizardStepName: nextStep },
          traveller
        )

        // Assert
        expect(result.wizardStepName).toEqual(nextStep)
      })

      test("when provided with valid attributes, it updates and returns the travel authorization", async () => {
        // Arrange
        const traveller = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory.create({
          status: TravelAuthorization.Statuses.DRAFT,
          userId: traveller.id,
          wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
        })

        // Act
        const updatedTravelAuthorization = await UpdateService.perform(
          travelAuthorization,
          {
            wizardStepName: TravelAuthorization.WizardStepNames.EDIT_TRIP_DETAILS,
          },
          traveller
        )

        // Assert
        expect(updatedTravelAuthorization).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            wizardStepName: TravelAuthorization.WizardStepNames.EDIT_TRIP_DETAILS,
          })
        )
      })
    })
  })
})
