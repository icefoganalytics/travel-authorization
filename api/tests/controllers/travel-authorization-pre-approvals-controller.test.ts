import { TravelAuthorizationPreApproval, User } from "@/models"

import { travelAuthorizationPreApprovalFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approvals-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalsController", () => {
    describe("#create - POST - /api/travel-authorization-pre-approvals", () => {
      test("when a nested profile department matches the pre-approval department, it creates the draft", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)

        // Act
        const response = await request().post("/api/travel-authorization-pre-approvals").send({
          department: "Finance",
          estimatedCost: 1200,
          location: "Dawson",
          profilesAttributes: [
            {
              profileName: "Jane.Traveller",
              department: "Finance",
            },
          ],
        })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelAuthorizationPreApproval: {
            id: expect.any(Number),
            creatorId: user.id,
            submissionId: null,
            estimatedCost: 1200,
            location: "Dawson",
            department: "Finance",
            branch: null,
            purpose: null,
            reason: null,
            startDate: null,
            endDate: null,
            isOpenForAnyDate: false,
            month: null,
            isOpenForAnyTraveler: false,
            numberTravelers: null,
            travelerNotes: null,
            status: "draft",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
            submission: null,
          },
        })
      })

      test("when a nested profile department differs from the pre-approval department, it rejects creation", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)

        // Act
        const response = await request().post("/api/travel-authorization-pre-approvals").send({
          department: "Finance",
          estimatedCost: 1200,
          location: "Dawson",
          profilesAttributes: [
            {
              profileName: "Jane.Traveller",
              department: "Health",
            },
          ],
        })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to create travel authorization pre-approval: Error: Profile department must match the pre-approval department.",
        })
      })

      test.each([
        { name: "omitted", attributes: {} },
        { name: "null", attributes: { department: null } },
        { name: "empty", attributes: { department: "" } },
        { name: "whitespace only", attributes: { department: " \t " } },
      ])("when the parent department is $name, it rejects creation", async ({ attributes }) => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        mockCurrentUser(user)

        // Act
        const response = await request().post("/api/travel-authorization-pre-approvals").send({
          ...attributes,
          estimatedCost: 1200,
          location: "Dawson",
          profilesAttributes: [
            {
              profileName: "Jane.Traveller",
            },
          ],
        })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to create travel authorization pre-approval: Error: Department is required.",
        })
      })
    })

    describe("#update - PATCH - /api/travel-authorization-pre-approvals/:travelAuthorizationPreApprovalId", () => {
      test("when the creator submits a new department and branch, it updates only the branch", async () => {
        // Arrange
        const user = await userFactory.create({
          department: "Finance",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            estimatedCost: 1200,
            location: "Dawson",
            department: "Finance",
            branch: "Travel",
            purpose: "Annual Financial Review",
            reason: "Review the upcoming budget",
            startDate: null,
            endDate: null,
            isOpenForAnyDate: true,
            month: "June",
            isOpenForAnyTraveler: false,
            numberTravelers: 1,
            travelerNotes: "Travel with the Finance team",
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}`)
          .send({
            department: "Health",
            branch: "Accounting",
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizationPreApproval: {
            id: preApproval.id,
            creatorId: user.id,
            submissionId: null,
            estimatedCost: 1200,
            location: "Dawson",
            department: "Finance",
            branch: "Accounting",
            purpose: "Annual Financial Review",
            reason: "Review the upcoming budget",
            startDate: null,
            endDate: null,
            isOpenForAnyDate: true,
            month: "June",
            isOpenForAnyTraveler: false,
            numberTravelers: 1,
            travelerNotes: "Travel with the Finance team",
            status: "draft",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            submission: null,
          },
          policy: {
            show: true,
            create: true,
            update: true,
            destroy: true,
          },
        })
      })
    })
  })
})
