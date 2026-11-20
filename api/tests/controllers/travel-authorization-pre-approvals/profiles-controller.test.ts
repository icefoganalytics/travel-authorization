import { TravelAuthorizationPreApproval } from "@/models"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approvals/profiles-controller.ts", () => {
  describe("ProfilesController", () => {
    describe("#create - POST - /api/travel-authorization-pre-approvals/:travelAuthorizationPreApprovalId/profiles", () => {
      test("when the department is omitted, it creates a profile in the parent department", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            estimatedCost: 1200,
            location: "Whitehorse",
            department: "Finance",
            purpose: "Annual Financial Review",
            startDate: null,
            endDate: null,
            isOpenForAnyDate: true,
            month: "June",
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })

        // Act
        const response = await request()
          .post(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles`)
          .send({
            profileName: "Jane.Traveller",
            branch: "Travel",
          })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelAuthorizationPreApprovalProfile: {
            id: expect.any(Number),
            preApprovalId: preApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Travel",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            preApproval: {
              id: preApproval.id,
              estimatedCost: 1200,
              location: "Whitehorse",
              purpose: "Annual Financial Review",
              startDate: null,
              endDate: null,
              isOpenForAnyDate: true,
              month: "June",
              status: "draft",
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          },
        })
      })

      test("when the body names a different pre-approval, it creates the profile under the pre-approval in the URL", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const urlPreApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            estimatedCost: 1200,
            location: "Whitehorse",
            department: "Finance",
            purpose: "Annual Financial Review",
            startDate: null,
            endDate: null,
            isOpenForAnyDate: true,
            month: "June",
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })
        const bodyPreApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })

        // Act
        const response = await request()
          .post(`/api/travel-authorization-pre-approvals/${urlPreApproval.id}/profiles`)
          .send({
            preApprovalId: bodyPreApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Travel",
          })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelAuthorizationPreApprovalProfile: {
            id: expect.any(Number),
            preApprovalId: urlPreApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Travel",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            preApproval: {
              id: urlPreApproval.id,
              estimatedCost: 1200,
              location: "Whitehorse",
              purpose: "Annual Financial Review",
              startDate: null,
              endDate: null,
              isOpenForAnyDate: true,
              month: "June",
              status: "draft",
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          },
        })
      })

      test("when the pre-approval in the URL does not exist, it returns not found", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const missingPreApprovalId = 999999

        // Act
        const response = await request()
          .post(`/api/travel-authorization-pre-approvals/${missingPreApprovalId}/profiles`)
          .send({
            profileName: "Jane.Traveller",
          })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel authorization pre-approval not found.",
        })
      })

      test("when the submitted department differs from the pre-approval department, it rejects creation", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })

        // Act
        const response = await request()
          .post(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles`)
          .send({
            profileName: "Jane.Traveller",
            department: "Health",
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to create travel authorization pre-approval profile: Error: Profile department must match the pre-approval department.",
        })
      })

      test("when the department is explicitly null, it rejects creation", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })

        // Act
        const response = await request()
          .post(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles`)
          .send({
            profileName: "Jane.Traveller",
            department: null,
          })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to create travel authorization pre-approval profile: Error: Profile department must match the pre-approval department.",
        })
      })

      test("when the body names a pre-approval in the caller's department but the URL does not, it denies creation", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const urlPreApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })
        const bodyPreApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            department: "Finance",
          })

        // Act
        const response = await request()
          .post(`/api/travel-authorization-pre-approvals/${urlPreApproval.id}/profiles`)
          .send({
            preApprovalId: bodyPreApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
          })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to create travel authorization pre-approval profiles.",
        })
      })
    })

    describe("#update - PATCH - /api/travel-authorization-pre-approvals/:travelAuthorizationPreApprovalId/profiles/:travelAuthorizationPreApprovalProfileId", () => {
      test("when the department is unchanged, it updates the branch", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            estimatedCost: 1200,
            location: "Whitehorse",
            department: "Finance",
            purpose: "Annual Financial Review",
            startDate: null,
            endDate: null,
            isOpenForAnyDate: true,
            month: "June",
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Travel",
          })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`)
          .send({
            department: "Finance",
            branch: "Accounting",
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizationPreApprovalProfile: {
            id: profile.id,
            preApprovalId: preApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Accounting",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            preApproval: {
              id: preApproval.id,
              estimatedCost: 1200,
              location: "Whitehorse",
              purpose: "Annual Financial Review",
              startDate: null,
              endDate: null,
              isOpenForAnyDate: true,
              month: "June",
              status: "draft",
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          },
          policy: {
            show: true,
            create: true,
            update: true,
            destroy: true,
          },
        })
      })

      test("when a profile update submits a different department, it ignores the department and updates the branch", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            estimatedCost: 1200,
            location: "Whitehorse",
            department: "Finance",
            purpose: "Annual Financial Review",
            startDate: null,
            endDate: null,
            isOpenForAnyDate: true,
            month: "June",
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Travel",
          })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`)
          .send({
            department: "Health",
            branch: "Accounting",
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizationPreApprovalProfile: {
            id: profile.id,
            preApprovalId: preApproval.id,
            profileName: "Jane.Traveller",
            department: "Finance",
            branch: "Accounting",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            preApproval: {
              id: preApproval.id,
              estimatedCost: 1200,
              location: "Whitehorse",
              purpose: "Annual Financial Review",
              startDate: null,
              endDate: null,
              isOpenForAnyDate: true,
              month: "June",
              status: "draft",
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          },
          policy: {
            show: true,
            create: true,
            update: true,
            destroy: true,
          },
        })
      })

      test("when the pre-approval in the URL does not exist, it returns the pre-approval not found error", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Finance" })
        const missingPreApprovalId = 999999

        // Act
        const response = await request()
          .patch(
            `/api/travel-authorization-pre-approvals/${missingPreApprovalId}/profiles/${profile.id}`
          )
          .send({ branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel authorization pre-approval not found.",
        })
      })

      test("when the pre-approval is forbidden and the profile does not exist, it denies the update", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Health" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const missingProfileId = 999999

        // Act
        const response = await request()
          .patch(
            `/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${missingProfileId}`
          )
          .send({ branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      })

      test("when the caller's department matches a legacy profile but not its pre-approval, it denies the update", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Health",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({
            department: "Health",
          })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`)
          .send({
            branch: "Accounting",
          })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      })

      test("when the caller's department matches the pre-approval but not a legacy profile, it denies the update", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Health" })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`)
          .send({ branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      })

      test("when the profile belongs to another pre-approval in the same department, it returns not found", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({ department: "Finance" })
        const otherPreApproval = await travelAuthorizationPreApprovalFactory.create({ department: "Finance" })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval: otherPreApproval })
          .create({ department: "Finance" })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`)
          .send({ branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      })
    })

    describe("#destroy - DELETE - /api/travel-authorization-pre-approvals/:travelAuthorizationPreApprovalId/profiles/:travelAuthorizationPreApprovalProfileId", () => {
      test("when the caller's department matches the profile and its pre-approval, it deletes the profile", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Health" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Health" })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(204)
        expect(response.body).toEqual({})
      })

      test("when the pre-approval in the URL does not exist, it returns the pre-approval not found error", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Finance" })
        const missingPreApprovalId = 999999

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${missingPreApprovalId}/profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel authorization pre-approval not found.",
        })
      })

      test("when the pre-approval is forbidden and the profile does not exist, it denies deletion", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Health" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const missingProfileId = 999999

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${missingProfileId}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to delete this travel authorization pre-approval profile.",
        })
      })

      test("when the caller's department matches a legacy profile but not its pre-approval, it denies deletion", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Health" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Health" })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to delete this travel authorization pre-approval profile.",
        })
      })

      test("when the caller's department matches the pre-approval but not a legacy profile, it denies deletion", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Health" })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to delete this travel authorization pre-approval profile.",
        })
      })

      test("when the profile belongs to another pre-approval in the same department, it returns not found", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const otherPreApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval: otherPreApproval })
          .create({ department: "Finance" })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${preApproval.id}/profiles/${profile.id}`
        )

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel Authorization Pre-Approval Profile not found",
        })
      })
    })
  })
})
