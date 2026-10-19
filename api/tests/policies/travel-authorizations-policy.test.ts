import { TravelAuthorization, User } from "@/models"
import { TravelAuthorizationsPolicy } from "@/policies"

import { travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-authorizations-policy.ts", () => {
  describe("TravelAuthorizationsPolicy", () => {
    describe("#permitAttributesForUpdate", () => {
      test("when a request is draft, it preserves trip details but excludes workflow changes", () => {
        // Arrange
        const user = userFactory.build()
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.DRAFT,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          eventName: "Updated trip purpose",
          status: TravelAuthorization.Statuses.EXPENSED,
          wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          eventName: "Updated trip purpose",
        })
      })

      test("when a request is submitted, it rejects a traveller's trip and workflow edits", () => {
        // Arrange
        const user = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          eventName: "Not editable after submission",
          status: TravelAuthorization.Statuses.DRAFT,
          wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({})
      })

      test("when a request is submitted, it permits administrator trip edits without workflow changes", () => {
        // Arrange
        const admin = userFactory.build({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })
        const policy = new TravelAuthorizationsPolicy(admin, travelAuthorization)
        const attributes = {
          eventName: "Corrected trip purpose",
          status: TravelAuthorization.Statuses.DRAFT,
          wizardStepName: TravelAuthorization.WizardStepNames.EDIT_PURPOSE_DETAILS,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          eventName: "Corrected trip purpose",
        })
      })

      test("when a request is approved, it permits actual-trip details but not estimated-trip edits", () => {
        // Arrange
        const user = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
          tripTypeEstimate: TravelAuthorization.TripTypes.MULTI_CITY,
          eventName: "Not editable after approval",
        }

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
        })
      })

      test("when a request has no workflow state, it does not accept trip or workflow edits", () => {
        // Arrange
        const user = userFactory.build()
        const travelAuthorization = travelAuthorizationFactory.build({
          status: null,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          eventName: "Not editable without a workflow state",
          status: TravelAuthorization.Statuses.DRAFT,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForUpdate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({})
      })
    })

    describe("#permitAttributesForCreate", () => {
      test("when the policy record is draft, it filters traveller workflow and ownership fields", () => {
        // Arrange
        const user = userFactory.build({
          id: 1,
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: user.id,
          status: TravelAuthorization.Statuses.DRAFT,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          eventName: "Travel planning meeting",
          userId: 2,
          userAttributes: {
            email: "another-traveller@example.com",
          },
          createdBy: 2,
          status: TravelAuthorization.Statuses.EXPENSED,
          wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForCreate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          eventName: "Travel planning meeting",
        })
      })

      test("when the policy record is draft, an administrator can select the traveller", () => {
        // Arrange
        const admin = userFactory.build({
          id: 1,
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: 2,
          status: TravelAuthorization.Statuses.DRAFT,
        })
        const policy = new TravelAuthorizationsPolicy(admin, travelAuthorization)
        const attributes = {
          eventName: "Travel planning meeting",
          userId: 2,
          status: null,
          wizardStepName: TravelAuthorization.WizardStepNames.REVIEW_EXPENSES,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForCreate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          eventName: "Travel planning meeting",
          userId: 2,
        })
      })

      test("when the policy record is approved, it permits actual-trip details instead of draft fields", () => {
        // Arrange
        const user = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          eventName: "Not a draft edit",
          tripTypeEstimate: TravelAuthorization.TripTypes.ROUND_TRIP,
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
          status: TravelAuthorization.Statuses.DRAFT,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForCreate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({
          tripTypeActual: TravelAuthorization.TripTypes.ONE_WAY,
        })
      })

      test("when the policy record has no initial state, it does not infer draft permissions", () => {
        // Arrange
        const user = userFactory.build({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: null,
        })
        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)
        const attributes = {
          eventName: "Not permitted without an initialized state",
          status: TravelAuthorization.Statuses.DRAFT,
        }

        // Act
        const permittedAttributes = policy.permitAttributesForCreate(attributes)

        // Assert
        expect(permittedAttributes).toEqual({})
      })
    })
  })
})
