import { PassThrough } from "node:stream"
import { buffer } from "node:stream/consumers"

import Papa from "papaparse"

import { TravelAuthorizationPreApproval, User } from "@/models"
import { TravelAuthorizationPreApprovalsPolicy } from "@/policies"
import { CreateCsvService } from "@/services/downloads/travel-authorization-pre-approvals/create-csv-service"

import {
  travelAuthorizationPreApprovalFactory,
  travelAuthorizationPreApprovalProfileFactory,
  userFactory,
} from "@/factories"

describe("api/src/services/downloads/travel-authorization-pre-approvals/create-csv-service.ts", () => {
  describe("CreateCsvService", () => {
    describe(".perform", () => {
      test("when fields contain delimiters and formulas, it preserves text and neutralizes formulas", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: "Finance" })
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
          branch: 'North, "Yukon"',
          isOpenForAnyDate: true,
          month: "Any time in November",
          location: "Whitehorse\r\nDawson",
          purpose: " \t=SUM(A1:A2)",
          estimatedCost: 1,
          reason: "@example",
          status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          travelerNotes: '-1+2, "quoted"\nnext line',
        })
        await travelAuthorizationPreApprovalProfileFactory.associations({ preApproval }).create({
          department: "Finance",
          profileName: '=HYPERLINK("example").Name',
        })
        const scopedTravelAuthorizationPreApprovals =
          TravelAuthorizationPreApprovalsPolicy.applyScope([], user1)
        const outputStream = new PassThrough()
        const content = buffer(outputStream)

        // Act
        await CreateCsvService.perform(
          scopedTravelAuthorizationPreApprovals,
          { id: preApproval.id },
          undefined,
          user1,
          outputStream
        )
        const csvBuffer = await content
        const parsedCsv = Papa.parse<Record<string, string>>(csvBuffer.toString("utf-8"), {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(parsedCsv.data).toEqual([
          {
            Name: '\'=HYPERLINK("example") Name',
            Department: "Finance",
            Branch: 'North, "Yukon"',
            "Travel Date": "Any time in November",
            Location: "Whitehorse\r\nDawson",
            Purpose: "' \t=SUM(A1:A2)",
            "Estimated Cost": "$1.000",
            Reason: "'@example",
            Status: "draft",
            Notes: '\'-1+2, "quoted"\nnext line',
          },
        ])
      })

      test("when a user has no department, it exports no records even if where selects one", async () => {
        // Arrange
        const user1 = await userFactory.create({ roles: [User.Roles.USER], department: null })
        const preApproval = await travelAuthorizationPreApprovalFactory.create({
          department: "Finance",
        })
        const scopedTravelAuthorizationPreApprovals =
          TravelAuthorizationPreApprovalsPolicy.applyScope([], user1)
        const outputStream = new PassThrough()
        const content = buffer(outputStream)

        // Act
        await CreateCsvService.perform(
          scopedTravelAuthorizationPreApprovals,
          { id: preApproval.id },
          undefined,
          user1,
          outputStream
        )
        const csvBuffer = await content

        // Assert
        expect(csvBuffer.toString("utf-8")).toEqual(
          "\uFEFFName,Department,Branch,Travel Date,Location,Purpose,Estimated Cost,Reason,Status,Notes\r\n"
        )
      })
    })
  })
})
