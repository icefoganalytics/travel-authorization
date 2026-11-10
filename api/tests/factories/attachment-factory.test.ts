import { Attachment } from "@/models"

import { attachmentFactory, expenseFactory } from "@/factories"

describe("api/tests/factories/attachment-factory.ts", () => {
  describe("attachmentFactory", () => {
    describe("#build", () => {
      test("when binary content is overridden, it preserves every byte", () => {
        // Arrange
        const content = Buffer.from([0, 255, 128, 65, 0, 10])

        // Act
        const attachment = attachmentFactory.build({
          targetId: 42,
          targetType: Attachment.TargetTypes.Expense,
          content,
          size: content.length,
        })

        // Assert
        expect(attachment.content).toEqual(content)
      })
    })

    describe("#create", () => {
      test("when binary content is overridden, it persists every byte through reload", async () => {
        // Arrange
        const expense = await expenseFactory.create()
        const content = Buffer.from([0, 255, 128, 65, 0, 10])

        // Act
        const attachment = await attachmentFactory.create({
          targetId: expense.id,
          targetType: Attachment.TargetTypes.Expense,
          content,
          size: content.length,
        })

        // Assert
        const reloadedAttachment = await Attachment.withScope("withContent").findByPk(attachment.id)
        expect(reloadedAttachment?.content).toEqual(content)
      })
    })
  })
})
