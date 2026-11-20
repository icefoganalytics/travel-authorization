import { TravelAuthorizationPreApproval } from "@/models"

import { travelAuthorizationPreApprovalFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approvals-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalsController", () => {
    describe("#create", () => {
      test("when a nested profile department differs from the pre-approval department, it rejects creation", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
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
    })

    describe("#update", () => {
      test("when the department is unchanged, it updates the other pre-approval fields", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            department: "Finance",
            branch: "Travel",
            startDate: null,
            endDate: null,
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}`)
          .send({ department: "Finance", branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizationPreApproval: {
            id: preApproval.id,
            creatorId: user.id,
            submissionId: null,
            estimatedCost: preApproval.estimatedCost,
            location: preApproval.location,
            department: "Finance",
            branch: "Accounting",
            purpose: preApproval.purpose,
            reason: preApproval.reason,
            startDate: null,
            endDate: null,
            isOpenForAnyDate: preApproval.isOpenForAnyDate,
            month: preApproval.month,
            isOpenForAnyTraveler: preApproval.isOpenForAnyTraveler,
            numberTravelers: preApproval.numberTravelers,
            travelerNotes: preApproval.travelerNotes,
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

      test("when the creator submits a different department, it rejects the update", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({ department: "Finance" })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}`)
          .send({ department: "Health" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to update travel authorization pre-approval: Error: Department cannot be changed.",
        })
      })
    })
  })
})
