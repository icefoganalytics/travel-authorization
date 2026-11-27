import { travelAuthorizationPreApprovalFactory } from "@/factories"

describe("api/src/models/travel-authorization-pre-approval.ts", () => {
  describe("TravelAuthorizationPreApproval", () => {
    describe("validations - department", () => {
      test.each(["", " \t ", "Economic Development"])(
        "when department is the non-null string %j, model validation accepts it",
        async (department) => {
          // Arrange
          const preApproval = travelAuthorizationPreApprovalFactory.build({
            creatorId: 1,
            department,
          })

          // Act
          const validation = preApproval.validate()

          // Assert
          await expect(validation).resolves.toBe(preApproval)
        }
      )
    })
  })
})
