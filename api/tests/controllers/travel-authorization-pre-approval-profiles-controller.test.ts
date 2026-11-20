import { TravelAuthorizationPreApproval } from "@/models"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approval-profiles-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalProfilesController", () => {
    describe("#create", () => {
      test.each([
        { description: "omitted", departmentAttributes: {} },
        { description: "the same as the parent's", departmentAttributes: { department: "Finance" } },
      ])(
        "when the department is $description, it creates a profile in the parent department",
        async ({ departmentAttributes }) => {
          // Arrange
          const user = await userFactory.create({ department: "Finance" })
          mockCurrentUser(user)
          const preApproval = await travelAuthorizationPreApprovalFactory
            .associations({ creator: user })
            .create({
              department: "Finance",
              startDate: null,
              endDate: null,
              status: TravelAuthorizationPreApproval.Statuses.DRAFT,
            })

          // Act
          const response = await request()
            .post("/api/travel-authorization-pre-approval-profiles")
            .send({
              preApprovalId: preApproval.id,
              profileName: "Jane.Traveller",
              branch: "Travel",
              ...departmentAttributes,
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
                estimatedCost: preApproval.estimatedCost,
                location: preApproval.location,
                purpose: preApproval.purpose,
                startDate: null,
                endDate: null,
                isOpenForAnyDate: preApproval.isOpenForAnyDate,
                month: preApproval.month,
                status: "draft",
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
            },
          })
        }
      )

      test.each(["Health", null])(
        "when the submitted department is %s rather than the parent's, it rejects creation",
        async (department) => {
          // Arrange
          const user = await userFactory.create({ department: "Finance" })
          mockCurrentUser(user)
          const preApproval = await travelAuthorizationPreApprovalFactory
            .associations({ creator: user })
            .create({ department: "Finance" })

          // Act
          const response = await request()
            .post("/api/travel-authorization-pre-approval-profiles")
            .send({
              preApprovalId: preApproval.id,
              profileName: "Jane.Traveller",
              department,
            })

          // Assert
          expect(response.status).toEqual(422)
          expect(response.body).toEqual({
            message:
              "Failed to create travel authorization pre-approval profile: Error: Profile department must match the pre-approval department.",
          })
        }
      )

      test("when a caller submits their department for another department's pre-approval, it denies creation", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })

        // Act
        const response = await request()
          .post("/api/travel-authorization-pre-approval-profiles")
          .send({
            preApprovalId: preApproval.id,
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

    describe("#update", () => {
      test("when the department is unchanged, it updates the other profile fields", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({
            department: "Finance",
            startDate: null,
            endDate: null,
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
          .patch(`/api/travel-authorization-pre-approval-profiles/${profile.id}`)
          .send({ department: "Finance", branch: "Accounting" })

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
              estimatedCost: preApproval.estimatedCost,
              location: preApproval.location,
              purpose: preApproval.purpose,
              startDate: null,
              endDate: null,
              isOpenForAnyDate: preApproval.isOpenForAnyDate,
              month: preApproval.month,
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

      test("when a profile update submits a different department, it rejects the update", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory
          .associations({ creator: user })
          .create({ department: "Finance" })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Finance" })

        // Act
        const response = await request()
          .patch(`/api/travel-authorization-pre-approval-profiles/${profile.id}`)
          .send({ department: "Health" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to update travel authorization pre-approval profile: Error: Department cannot be changed.",
        })
      })

      test("when the caller's department matches a legacy profile but not its pre-approval, it denies the update", async () => {
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
        const response = await request()
          .patch(`/api/travel-authorization-pre-approval-profiles/${profile.id}`)
          .send({ branch: "Accounting" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message:
            "You are not authorized to update this travel authorization pre-approval profile.",
        })
      })
    })
  })
})
