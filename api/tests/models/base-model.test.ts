import { EmptyResultError } from "@sequelize/core"

import { travelAuthorizationFactory } from "@/factories"

describe("api/src/models/base-model.ts", () => {
  describe("BaseModel", () => {
    describe("#reloadWithScope", () => {
      test("when a draft has no travel segments, it reloads with an empty itinerary", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()

        // Act
        const result = await travelAuthorization.reloadWithScope("asShow", {
          rejectOnEmpty: true,
        })

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            id: travelAuthorization.id,
            travelSegments: [],
          })
        )
      })

      test("when the authorization was deleted, it still rejects the missing record", async () => {
        // Arrange
        const travelAuthorization = await travelAuthorizationFactory.create()
        await travelAuthorization.destroy()

        // Act
        const result = travelAuthorization.reloadWithScope("asShow", {
          rejectOnEmpty: false,
        })

        // Assert
        await expect(result).rejects.toThrow(EmptyResultError)
      })
    })
  })
})
