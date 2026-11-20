import { TravelAuthorizationPreApproval } from "@/models"

import { travelAuthorizationPreApprovalFactory, userFactory } from "@/factories"
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
  })
})
