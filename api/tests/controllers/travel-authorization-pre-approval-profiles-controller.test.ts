import { TravelAuthorizationPreApproval } from "@/models"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-authorization-pre-approval-profiles-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalProfilesController", () => {
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

      test("when a profile update submits a different department, it ignores the department and updates the branch", async () => {
        // Arrange
        const user = await userFactory.create({ department: "Finance" })
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
          .patch(`/api/travel-authorization-pre-approval-profiles/${profile.id}`)
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

    describe("#destroy", () => {
      test.each([
        { parentDepartment: "Health", expectedStatus: 204 },
        { parentDepartment: "Finance", expectedStatus: 403 },
      ])("when Health deletes a Health profile under $parentDepartment, it returns $expectedStatus", async ({ parentDepartment, expectedStatus }) => {
        // Arrange
        const user = await userFactory.create({ department: "Health" })
        mockCurrentUser(user)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: parentDepartment,
        })
        const profile = await travelAuthorizationPreApprovalProfileFactory
          .associations({ preApproval })
          .create({ department: "Health" })

        // Act
        const response = await request().delete(`/api/travel-authorization-pre-approval-profiles/${profile.id}`)

        // Assert
        expect(response.status).toEqual(expectedStatus)
      })
    })
  })
})
