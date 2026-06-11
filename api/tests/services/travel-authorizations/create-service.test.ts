import { faker } from "@faker-js/faker"

import { TravelAuthorization, User } from "@/models"
import { Users } from "@/services"
import { CreateService } from "@/services/travel-authorizations"

import { userFactory } from "@/factories"

describe("api/src/services/travel-authorizations/create-service.ts", () => {
  const userEnsureServicePerformMock = vi.fn()

  beforeEach(async () => {
    Users.EnsureService.perform = userEnsureServicePerformMock
  })

  describe("CreateService", () => {
    describe(".perform", () => {
      test("when provided with valid attributes, it creates a travel authorization with appropriate defaults", async () => {
        // Arrange
        const creator = await userFactory.create()

        // Act
        const travelAuthorization = await CreateService.perform({}, creator)

        // Assert
        expect(travelAuthorization).toEqual(
          expect.objectContaining({
            userId: creator.id,
            createdBy: creator.id,
            slug: expect.any(String),
            status: TravelAuthorization.Statuses.DRAFT,
            tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
            wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
          })
        )
      })

      test("when creator is admin, and user attributes are supplied, it calls EnsureUser with those attributes", async () => {
        // Arrange
        const email = faker.internet.email().toLowerCase()
        userEnsureServicePerformMock.mockImplementation(() => {
          return userFactory.create({
            email,
          })
        })

        const userAttributes = { email }
        const travelAuthorizationAttributes = {
          userAttributes,
        }
        const creator = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })

        // Act
        const travelAuthorization = await CreateService.perform(
          travelAuthorizationAttributes,
          creator
        )

        // Assert
        expect.assertions(2)
        expect(userEnsureServicePerformMock).toHaveBeenCalledWith(userAttributes, creator)
        expect(travelAuthorization).toEqual(
          expect.objectContaining({
            user: expect.objectContaining({
              email,
            }),
          })
        )
      })

      test("when creator is admin, and user attributes are not supplied, it does not call EnsureUser", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorizationAttributes = {
          userId: user.id,
        }
        const creator = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })

        // Act
        const travelAuthorization = await CreateService.perform(
          travelAuthorizationAttributes,
          creator
        )

        // Assert
        expect.assertions(2)
        expect(userEnsureServicePerformMock).not.toHaveBeenCalled()
        expect(travelAuthorization).toEqual(
          expect.objectContaining({
            user: expect.objectContaining({
              email: user.email,
            }),
          })
        )
      })

      test("when creator is not admin, and user attributes are supplied, it does not call EnsureUser", async () => {
        // Arrange
        const user = await userFactory.create()
        const travelAuthorizationAttributes = {
          userId: user.id,
        }
        const creator = await userFactory.create({
          roles: [User.Roles.USER],
        })

        // Act
        const travelAuthorization = await CreateService.perform(
          travelAuthorizationAttributes,
          creator
        )

        // Assert
        expect.assertions(2)
        expect(userEnsureServicePerformMock).not.toHaveBeenCalled()
        expect(travelAuthorization).toEqual(
          expect.objectContaining({
            user: expect.objectContaining({
              email: creator.email,
            }),
          })
        )
      })
    })
  })
})
