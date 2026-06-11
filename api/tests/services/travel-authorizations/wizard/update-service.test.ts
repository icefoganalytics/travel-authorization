import { TravelAuthorization } from "@/models"
import UpdateService from "@/services/travel-authorizations/wizard/update-service"

import { travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/wizard/update-service.ts", () => {
  describe("UpdateService", () => {
    describe(".perform", () => {
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
