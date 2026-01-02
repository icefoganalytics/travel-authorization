import { expenseFactory, userFactory } from "@/factories"

describe("api/src/models/expense.ts", () => {
  describe("Expense", () => {
    describe("Model Validation", () => {
      describe("#ensureApproveRejectExclusivity", () => {
        test("when expense has both approvedAt and rejectedAt, throws an error", async () => {
          // Arrange
          const approver = await userFactory.create()
          const rejector = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              approverId: approver.id,
              approvedAt: new Date(),
              rejectorId: rejector.id,
              rejectedAt: new Date(),
              rejectionNote: "Test rejection",
            })
          ).rejects.toThrow("An expense cannot be both approved and rejected.")
        })

        test("when expense has only approval fields set, does not throw", async () => {
          // Arrange
          const approver = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              approverId: approver.id,
              approvedAt: new Date(),
            })
          ).resolves.not.toThrow()
        })

        test("when expense has only rejection fields set, does not throw", async () => {
          // Arrange
          const rejector = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              rejectorId: rejector.id,
              rejectedAt: new Date(),
              rejectionNote: "Test rejection",
            })
          ).resolves.not.toThrow()
        })
      })

      describe("#ensureApprovalFieldsSetTogether", () => {
        test("when approverId is set but approvedAt is null, throws an error", async () => {
          // Arrange
          const approver = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              approverId: approver.id,
              approvedAt: null,
            })
          ).rejects.toThrow(
            "Approval fields (approverId, approvedAt) must all be set or all be null."
          )
        })

        test("when approvedAt is set but approverId is null, throws an error", async () => {
          // Arrange
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              approverId: null,
              approvedAt: new Date(),
            })
          ).rejects.toThrow(
            "Approval fields (approverId, approvedAt) must all be set or all be null."
          )
        })

        test("when both approval fields are set, does not throw", async () => {
          // Arrange
          const approver = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              approverId: approver.id,
              approvedAt: new Date(),
            })
          ).resolves.not.toThrow()
        })

        test("when both approval fields are null, does not throw", async () => {
          // Arrange
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              approverId: null,
              approvedAt: null,
            })
          ).resolves.not.toThrow()
        })
      })

      describe("#ensureRejectionFieldsSetTogether", () => {
        test("when rejectorId is set but rejectedAt and rejectionNote are null, throws an error", async () => {
          // Arrange
          const rejector = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              rejectorId: rejector.id,
              rejectedAt: null,
              rejectionNote: null,
            })
          ).rejects.toThrow(
            "Rejection fields (rejectorId, rejectedAt, rejectionNote) must all be set or all be null."
          )
        })

        test("when rejectionNote is missing, throws an error", async () => {
          // Arrange
          const rejector = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              rejectorId: rejector.id,
              rejectedAt: new Date(),
              rejectionNote: null,
            })
          ).rejects.toThrow(
            "Rejection fields (rejectorId, rejectedAt, rejectionNote) must all be set or all be null."
          )
        })

        test("when all rejection fields are set, does not throw", async () => {
          // Arrange
          const rejector = await userFactory.create()
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              rejectorId: rejector.id,
              rejectedAt: new Date(),
              rejectionNote: "Test rejection note",
            })
          ).resolves.not.toThrow()
        })

        test("when all rejection fields are null, does not throw", async () => {
          // Arrange
          const expense = await expenseFactory.create()

          // Act & Assert
          await expect(
            expense.update({
              rejectorId: null,
              rejectedAt: null,
              rejectionNote: null,
            })
          ).resolves.not.toThrow()
        })
      })
    })
  })
})
