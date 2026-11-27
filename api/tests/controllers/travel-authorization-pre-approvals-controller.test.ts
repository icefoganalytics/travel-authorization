import { TravelAuthorizationPreApproval } from "@/models"

import { travelAuthorizationPreApprovalFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approvals-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalsController", () => {
    describe("#index - GET - /api/travel-authorization-pre-approvals", () => {
      test("when the caller's only department is UNKNOWN, it omits legacy pre-approvals", async () => {
        // Arrange
        const user = await userFactory.create({ department: "UNKNOWN" })
        mockCurrentUser(user)
        await travelAuthorizationPreApprovalFactory.create({ department: "UNKNOWN" })

        // Act
        const response = await request().get("/api/travel-authorization-pre-approvals")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizationPreApprovals: [],
          totalCount: 0,
        })
      })

      test("when the caller is an admin, it includes a legacy pre-approval with department UNKNOWN", async () => {
        // Arrange
        const user = await userFactory.asAdmin().create()
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
          startDate: null,
          endDate: null,
        })

        // Act
        const response = await request().get("/api/travel-authorization-pre-approvals")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelAuthorizationPreApprovals: [
            {
              id: preApproval.id,
              creatorId: preApproval.creatorId,
              submissionId: null,
              estimatedCost: preApproval.estimatedCost,
              location: preApproval.location,
              department: "UNKNOWN",
              branch: preApproval.branch,
              purpose: preApproval.purpose,
              reason: preApproval.reason,
              startDate: null,
              endDate: null,
              isOpenForAnyDate: preApproval.isOpenForAnyDate,
              month: preApproval.month,
              isOpenForAnyTraveler: preApproval.isOpenForAnyTraveler,
              numberTravelers: preApproval.numberTravelers,
              travelerNotes: preApproval.travelerNotes,
              status: preApproval.status,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ],
          totalCount: 1,
        })
      })
    })

    describe("#show - GET - /api/travel-authorization-pre-approvals/:travelAuthorizationPreApprovalId", () => {
      test("when a non-admin shares only UNKNOWN with a legacy pre-approval, it denies viewing it", async () => {
        // Arrange
        const user = await userFactory.create({ department: "UNKNOWN" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
        })

        // Act
        const response = await request().get(
          `/api/travel-authorization-pre-approvals/${preApproval.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to view this travel authorization pre-approval.",
        })
      })
    })

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
        { name: "UNKNOWN", attributes: { department: "UNKNOWN" } },
      ])("when the parent department is $name, it rejects creation", async ({ attributes }) => {
        // Arrange
        const user = await userFactory.asAdmin().create()
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

      test("when a departmental pre-approval admin shares only UNKNOWN with another creator's pre-approval, it denies updates", async () => {
        // Arrange
        const user = await userFactory.asPreApprovedTravelAdmin().create({
          department: "UNKNOWN",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
        })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approvals/${preApproval.id}`)
          .send({ branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this travel authorization pre-approval.",
        })
      })
    })

    describe("#destroy - DELETE - /api/travel-authorization-pre-approvals/:travelAuthorizationPreApprovalId", () => {
      test("when a departmental pre-approval admin shares only UNKNOWN with another creator's pre-approval, it denies deletion", async () => {
        // Arrange
        const user = await userFactory.asPreApprovedTravelAdmin().create({
          department: "UNKNOWN",
        })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "UNKNOWN",
        })

        // Act
        const response = await request().delete(
          `/api/travel-authorization-pre-approvals/${preApproval.id}`
        )

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to delete this travel authorization pre-approval.",
        })
      })
    })
  })
})
