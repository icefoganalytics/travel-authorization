import { TravelAuthorization, User } from "@/models"
import { TravelAuthorizationsPolicy } from "@/policies"

import { travelAuthorizationFactory, userFactory } from "@/factories"

describe("api/src/policies/travel-authorizations-policy.ts", () => {
  describe("TravelAuthorizationsPolicy", () => {
    describe("#permittedAttributes", () => {
      test("when record is draft, returns correct attributes", async () => {
        const user = userFactory.build()
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)

        expect(policy.permittedAttributes()).toEqual([
          "preApprovalProfileId",
          "purposeId",
          "firstName",
          "lastName",
          "department",
          "division",
          "branch",
          "unit",
          "email",
          "mailcode",
          "daysOffTravelStatusEstimate",
          "dateBackToWorkEstimate",
          "travelDurationEstimate",
          "travelAdvance",
          "eventName",
          "summary",
          "benefits",
          "supervisorEmail",
          "approved",
          "requestChange",
          "denialReason",
          "tripTypeEstimate",
          "travelAdvanceInCents",
          "allTravelWithinTerritory",
          {
            travelSegmentEstimatesAttributes: expect.any(Array),
          },
        ])
      })

      test("when record is submitted, and user is regular user, returns correct attributes", () => {
        const user = userFactory.build({ roles: [User.Roles.USER] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)

        expect(policy.permittedAttributes()).toEqual([])
      })

      test("when record is submitted, and user is admin, returns correct attributes", () => {
        const admin = userFactory.build({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

        const policy = new TravelAuthorizationsPolicy(admin, travelAuthorization)

        expect(policy.permittedAttributes()).toEqual([
          "preApprovalProfileId",
          "purposeId",
          "firstName",
          "lastName",
          "department",
          "division",
          "branch",
          "unit",
          "email",
          "mailcode",
          "daysOffTravelStatusEstimate",
          "dateBackToWorkEstimate",
          "travelDurationEstimate",
          "travelAdvance",
          "eventName",
          "summary",
          "benefits",
          "supervisorEmail",
          "approved",
          "requestChange",
          "denialReason",
          "tripTypeEstimate",
          "travelAdvanceInCents",
          "allTravelWithinTerritory",
          {
            travelSegmentEstimatesAttributes: expect.any(Array),
          },
        ])
      })

      test("when record is approved, returns correct attributes", () => {
        const user = userFactory.build({ roles: [User.Roles.USER] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.APPROVED,
        })

        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)

        expect(policy.permittedAttributes()).toEqual([
          "daysOffTravelStatusActual",
          "dateBackToWorkActual",
          "travelDurationActual",
          "tripTypeActual",
          {
            travelSegmentActualsAttributes: expect.any(Array),
          },
        ])
      })

      test("when record has an unspecified status, returns correct attributes", () => {
        const user = userFactory.build()
        const travelAuthorization = travelAuthorizationFactory.build({
          status: null,
        })

        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)

        expect(policy.permittedAttributes()).toEqual([])
      })
    })

    describe("#permitAttributesForCreate", () => {
      test("when a traveller supplies workflow and ownership fields, it preserves only draft details", () => {
        // Arrange
        const user = userFactory.build({
          id: 1,
          roles: [User.Roles.USER],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: user.id,
          status: TravelAuthorization.Statuses.EXPENSED,
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

      test("when status is null, an administrator can preserve draft details for the selected traveller", () => {
        // Arrange
        const admin = userFactory.build({
          id: 1,
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = travelAuthorizationFactory.build({
          userId: 2,
          status: null,
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
    })
  })
})
