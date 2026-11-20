import { travelAuthorizationPreApprovalFactory } from "@/factories"

describe("api/src/models/travel-authorization-pre-approval.ts", () => {
  describe("TravelAuthorizationPreApproval", () => {
    describe("validations - department", () => {
      test("when the department is nonblank, it accepts the pre-approval", async () => {
        // Arrange
        const preApproval = travelAuthorizationPreApprovalFactory.build({
          creatorId: 1,
          department: "Economic Development",
        })

        // Act
        const validation = preApproval.validate()

        // Assert
        await expect(validation).resolves.toBe(preApproval)
      })

      test("when the department is whitespace only, it rejects the pre-approval", async () => {
        // Arrange
        const preApproval = travelAuthorizationPreApprovalFactory.build({
          creatorId: 1,
          department: " \t ",
        })

        // Act
        const validation = preApproval.validate()

        // Assert
        await expect(validation).rejects.toThrow("Department is required.")
      })
    })
  })
})
