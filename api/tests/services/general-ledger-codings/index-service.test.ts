import { IndexService } from "@/services/general-ledger-codings"
import { generalLedgerCodingFactory, travelAuthorizationFactory, userFactory } from "@/factories"
import { User } from "@/models"

describe("api/src/services/general-ledger-codings/index-service.ts", () => {
  describe("IndexService", () => {
    describe(".perform", () => {
      test("when called without filters, it returns all records and their total amount", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        const generalLedgerCoding1 = await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 100,
        })
        const generalLedgerCoding2 = await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 200,
        })

        // Act
        const result = await IndexService.perform(
          {},
          [],
          undefined,
          10,
          0,
          user
        )

        // Assert
        expect(result).toEqual({
          generalLedgerCodings: [
            expect.objectContaining({
              id: generalLedgerCoding1.id,
            }),
            expect.objectContaining({
              id: generalLedgerCoding2.id,
            }),
          ],
          totalCount: 2,
          summaries: {
            totalAmount: 300,
          },
        })
      })

      test("when called with a where filter, it scopes count, sum, and records", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 100,
        })
        const matchingGeneralLedgerCoding = await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 200,
        })

        // Act
        const result = await IndexService.perform(
          { id: matchingGeneralLedgerCoding.id },
          [],
          undefined,
          10,
          0,
          user
        )

        // Assert
        expect(result).toEqual({
          generalLedgerCodings: [
            expect.objectContaining({
              id: matchingGeneralLedgerCoding.id,
            }),
          ],
          totalCount: 1,
          summaries: {
            totalAmount: 200,
          },
        })
      })

      test("when called with pagination, it returns only the requested page", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
        })
        await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 100,
        })
        const secondGeneralLedgerCoding = await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 200,
        })

        // Act
        const result = await IndexService.perform(
          {},
          [],
          [["id", "ASC"]],
          1,
          1,
          user
        )

        // Assert
        expect(result).toEqual({
          generalLedgerCodings: [
            expect.objectContaining({
              id: secondGeneralLedgerCoding.id,
            }),
          ],
          totalCount: 2,
          summaries: {
            totalAmount: 300,
          },
        })
      })

      test("when there are no records, it returns empty results and zero totals", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })

        // Act
        const result = await IndexService.perform(
          {},
          [],
          undefined,
          10,
          0,
          user
        )

        // Assert
        expect(result).toEqual({
          generalLedgerCodings: [],
          totalCount: 0,
          summaries: {
            totalAmount: 0,
          },
        })
      })

      test("when policy scope restricts access, it only returns authorized records", async () => {
        // Arrange
        const adminUser = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: adminUser.id,
        })
        await generalLedgerCodingFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          amount: 100,
        })

        const otherUser = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const otherTravelAuthorization = await travelAuthorizationFactory.create({
          userId: otherUser.id,
        })
        const otherGeneralLedgerCoding = await generalLedgerCodingFactory.create({
          travelAuthorizationId: otherTravelAuthorization.id,
          amount: 200,
        })

        // Act — otherUser can only see their own records
        const result = await IndexService.perform(
          {},
          [],
          undefined,
          10,
          0,
          otherUser
        )

        // Assert
        expect(result).toEqual({
          generalLedgerCodings: [
            expect.objectContaining({
              id: otherGeneralLedgerCoding.id,
            }),
          ],
          totalCount: 1,
          summaries: {
            totalAmount: 200,
          },
        })
      })
    })
  })
})
