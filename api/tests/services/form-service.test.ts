import { TravelAuthorization } from "@/models"
import FormService from "@/services/form-service"

import {
  locationFactory,
  travelAuthorizationFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/form-service.ts", () => {
  describe("FormService", () => {
    describe("#submitForm", () => {
      test("when a legacy multi-city request has a selected arrival, it permits submission", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const primaryDestination = await locationFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: currentUser })
          .create({
            status: TravelAuthorization.Statuses.DRAFT,
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
            estimatedPrimaryDestinationId: primaryDestination.id,
          })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
            arrivalLocationId: primaryDestination.id,
          })
        const travelAuthorizationAttributes = travelAuthorization.get()
        const attributes = {
          ...travelAuthorizationAttributes,
          stops: [],
          expenses: [],
          estimates: [],
        }
        const service = new FormService()

        // Act
        const result = await service.submitForm(currentUser.id, attributes)

        // Assert
        expect(result).toEqual(true)
      })

      test("when a legacy multi-city request has no selected arrival, it rolls back submission", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({ user: currentUser })
          .create({
            status: TravelAuthorization.Statuses.DRAFT,
            tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          })
        await travelSegmentFactory
          .associations({ travelAuthorization })
          .create({
            isActual: false,
          })
        const travelAuthorizationAttributes = travelAuthorization.get()
        const attributes = {
          ...travelAuthorizationAttributes,
          stops: [],
          expenses: [],
          estimates: [],
        }
        const service = new FormService()

        // Act
        await service.submitForm(currentUser.id, attributes)
        await travelAuthorization.reload()

        // Assert
        expect(travelAuthorization.status).toEqual(TravelAuthorization.Statuses.DRAFT)
      })
    })
  })
})
