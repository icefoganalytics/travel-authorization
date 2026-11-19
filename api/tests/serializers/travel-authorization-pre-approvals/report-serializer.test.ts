import { TravelAuthorizationPreApproval } from "@/models"
import ReportSerializer from "@/serializers/travel-authorization-pre-approvals/report-serializer"

import { travelAuthorizationPreApprovalFactory } from "@/factories"

describe("api/src/serializers/travel-authorization-pre-approvals/report-serializer.ts", () => {
  describe("ReportSerializer", () => {
    describe(".perform", () => {
      test("when optional values and profiles are empty, it preserves blank columns and the single date", async () => {
        // Arrange
        const preApproval = await travelAuthorizationPreApprovalFactory
          .include("profiles")
          .create({
            department: null,
            branch: null,
            location: "",
            purpose: null,
            reason: null,
            travelerNotes: null,
            estimatedCost: 0,
            isOpenForAnyDate: false,
            startDate: null,
            endDate: new Date("2026-11-20T00:00:00.000Z"),
            status: TravelAuthorizationPreApproval.Statuses.DRAFT,
          })

        // Act
        const report = ReportSerializer.perform(preApproval)

        // Assert
        expect(report).toEqual({
          Name: "",
          Department: "",
          Branch: "",
          "Travel Date": "2026-11-20T00:00:00.000Z",
          Location: "",
          Purpose: "",
          "Estimated Cost": "$0.000",
          Reason: "",
          Status: "draft",
          Notes: "",
        })
      })

      test("when open-date text is missing, it does not fall back to fixed dates", async () => {
        // Arrange
        const preApproval = await travelAuthorizationPreApprovalFactory
          .include("profiles")
          .create({
            isOpenForAnyDate: true,
            month: null,
            startDate: new Date("2026-11-20T00:00:00.000Z"),
          })

        // Act
        const report = ReportSerializer.perform(preApproval)

        // Assert
        expect(report["Travel Date"]).toEqual("")
      })

      test("when profiles are not preloaded, it rejects incomplete report input", async () => {
        // Arrange
        const preApproval = await travelAuthorizationPreApprovalFactory.create()

        // Act / Assert
        expect(() => ReportSerializer.perform(preApproval)).toThrow(
          "Expected pre-approval profiles association to be preloaded."
        )
      })
    })
  })
})
