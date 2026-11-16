import Papa from "papaparse"
import qs from "qs"

import { TravelAuthorizationPreApproval, User } from "@/models"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"
import { mockCurrentUser, request } from "@/support"

const CSV_HEADERS =
  "Name,Department,Branch,Travel Date,Location,Purpose,Estimated Cost,Reason,Status,Notes\r\n"

describe("api/src/controllers/downloads/travel-authorization-pre-approvals-controller.ts", () => {
  describe("TravelAuthorizationPreApprovalsController", () => {
    describe("#create", () => {
      test("when records and profiles are visible, it exports their complete display values", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          branch: "Travel",
          estimatedCost: 1234,
          location: "Dawson",
          purpose: "Training",
          reason: "Annual meeting",
          travelerNotes: "Bring documents",
          status: TravelAuthorizationPreApproval.Statuses.APPROVED,
          isOpenForAnyDate: false,
          startDate: new Date("2026-11-20T00:00:00.000Z"),
          endDate: new Date("2026-11-22T00:00:00.000Z"),
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Finance",
          profileName: "Jane.Traveller",
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Finance",
          profileName: "Alex.Second.Name",
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Health",
          profileName: "Hidden.Profile",
        })
        await travelAuthorizationPreApprovalFactory.create({ department: "Health" })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv" })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(
          Buffer.from(
            "\uFEFF" +
              CSV_HEADERS +
              '"Jane Traveller, Alex Second.Name",Finance,Travel,2026-11-20T00:00:00.000Z to 2026-11-22T00:00:00.000Z,Dawson,Training,"$1,234.00",Annual meeting,approved,Bring documents\r\n'
          )
        )
      })

      test("when downloading CSV, it retains the familiar filename and CSV metadata", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv" })

        // Assert
        expect(response.headers).toEqual(
          expect.objectContaining({
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": expect.stringMatching(
              /^attachment; filename="Export, Travel Pre-Approval Requests, \d{4}-\d{2}-\d{2}_\d{4}\.csv"$/
            ),
          })
        )
      })

      test("when a hostile where query selects another department, it exports headers only", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)
        await travelAuthorizationPreApprovalFactory.create({ department: "Finance" })
        const hiddenPreApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Health",
        })
        const query = qs.stringify({
          format: "csv",
          where: { id: hiddenPreApproval.id, department: "Health" },
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query(query)
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from("\uFEFF" + CSV_HEADERS))
      })

      test("when the query has no matches, it exports headers only", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)
        await travelAuthorizationPreApprovalFactory.create({ department: "Finance" })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv", where: { location: "No matching destination" } })
          .responseType("blob")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual(Buffer.from("\uFEFF" + CSV_HEADERS))
      })

      test("when pagination is requested, it still exports all matches beyond the default page", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)
        await travelAuthorizationPreApprovalFactory.createList(12, {
          department: "Finance",
          branch: null,
          isOpenForAnyDate: true,
          month: "November",
          location: "Dawson",
          purpose: null,
          estimatedCost: 0,
          reason: null,
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          travelerNotes: null,
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv", perPage: 1, page: 2 })
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data).toEqual(
          Array.from({ length: 12 }, () => ({
            Name: "",
            Department: "Finance",
            Branch: "",
            "Travel Date": "November",
            Location: "Dawson",
            Purpose: "",
            "Estimated Cost": "$0.000",
            Reason: "",
            Status: "draft",
            Notes: "",
          }))
        )
      })

      test("when filters, where, and order are combined, they narrow and sort visible matches", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)
        const preApproval1 = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          submissionId: null,
          location: "Dawson",
        })
        const preApproval2 = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          submissionId: null,
          location: "Whitehorse",
        })
        const preApproval3 = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.APPROVED,
          location: "Excluded",
        })
        await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          location: "Not selected",
        })
        const query = qs.stringify({
          format: "csv",
          where: { id: [preApproval1.id, preApproval2.id, preApproval3.id] },
          filters: { availableForSubmission: true },
          order: [["location", "DESC"]],
        })

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query(query)
        const parsedCsv = Papa.parse<Record<string, string>>(response.text, {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(response.status).toEqual(200)
        expect(parsedCsv.data.map((row) => row.Location)).toEqual(["Whitehorse", "Dawson"])
      })

      test("when a format is unsupported, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER] })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "pdf" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({ message: "Unsupported report format" })
      })

      test("when a query fails, it does not set download headers", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv", where: { id: "invalid" } })

        // Assert
        expect(response.headers["content-disposition"]).toBeUndefined()
      })

      test("when a query fails, it returns an unprocessable response", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        mockCurrentUser(user1)

        // Act
        const response = await request()
          .post("/api/downloads/travel-authorization-pre-approvals")
          .query({ format: "csv", where: { id: "invalid" } })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to create travel authorization pre-approvals download",
        })
      })
    })
  })
})
