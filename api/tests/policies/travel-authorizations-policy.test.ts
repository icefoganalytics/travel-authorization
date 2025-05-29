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
          "wizardStepName",
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

        expect(policy.permittedAttributes()).toEqual(["wizardStepName"])
      })

      test("when record is submitted, and user is admin, returns correct attributes", () => {
        const admin = userFactory.build({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

        const policy = new TravelAuthorizationsPolicy(admin, travelAuthorization)

        expect(policy.permittedAttributes()).toEqual([
          "wizardStepName",
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
          "wizardStepName",
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

        expect(policy.permittedAttributes()).toEqual(["wizardStepName"])
      })
    })

    describe("#permittedAttributesForCreate", () => {
      test("when record is draft, and user is admin, creation attributes include user attributes and userId", () => {
        const admin = userFactory.build({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        const policy = new TravelAuthorizationsPolicy(admin, travelAuthorization)

        expect(policy.permittedAttributesForCreate()).toEqual(
          expect.arrayContaining([
            "userId",
            expect.objectContaining({
              userAttributes: expect.any(Array),
            }),
          ])
        )
      })

      test("when record is draft, and user is not an admin, creation attributes do not include user attributes and userId", () => {
        const user = userFactory.build({ roles: [User.Roles.USER] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.DRAFT,
        })

        const policy = new TravelAuthorizationsPolicy(user, travelAuthorization)

        expect(policy.permittedAttributesForCreate()).not.toEqual(
          expect.arrayContaining(["userId", "userAttributes"])
        )
      })

      test("when record is submitted, returns correct creation attributes", () => {
        const admin = userFactory.build({ roles: [User.Roles.ADMIN] })
        const travelAuthorization = travelAuthorizationFactory.build({
          status: TravelAuthorization.Statuses.SUBMITTED,
        })

        const policy = new TravelAuthorizationsPolicy(admin, travelAuthorization)

        expect(policy.permittedAttributesForCreate()).toEqual([
          "slug",
          "wizardStepName",
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
          "userId",
          {
            userAttributes: expect.any(Array),
          },
        ])
      })
    })
  })
})
