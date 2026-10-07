import { Response, NextFunction } from "express"
import { User } from "@/models"
import { auth0Integration, type Auth0UserInfo } from "@/integrations/auth0-integration"
import {
  authorizationMiddleware,
  type AuthorizationRequest,
} from "@/middleware/authorization-middleware"

vi.unmock("@/middleware/authorization-middleware")

vi.mock("@/integrations/auth0-integration")
vi.mock("@/utils/logger")

describe("api/src/middleware/authorization-middleware.ts", () => {
  describe(".authorizationMiddleware", () => {
    test.each([
      [1, "auth0|00001"],
      [2, "auth0|00002"],
      [3, "auth0|00003"],
      [4, "auth0|00004"],
      [5, "auth0|00005"],
      [10, "auth0|00006"],
      [50, "auth0|00007"],
      [100, "auth0|00008"],
    ])(
      "when create %i users, only one user should be created",
      async (attempts: number, auth0Subject: string) => {
        // Arrange
        const userData: Auth0UserInfo = {
          email: "dupe@test.com",
          firstName: "dupe",
          lastName: "UNKNOWN",
          auth0Subject: auth0Subject,
        }

        const req: Partial<AuthorizationRequest> = {
          headers: {
            authorization: auth0Subject,
          },
          auth: { sub: auth0Subject },
        }

        const res: Partial<Response> = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
        }

        const next: NextFunction = vi.fn()

        vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue(userData)

        const authorizationsRequestPromises = Array.from({ length: attempts }, async () => {
          await authorizationMiddleware(req as AuthorizationRequest, res as Response, next)
        })

        // Act
        await Promise.all(authorizationsRequestPromises)

        // Assert
        const users = await User.findAll({ where: { sub: auth0Subject } })
        expect(users.length).toEqual(1)
        expect(users[0]).toHaveProperty("sub", auth0Subject)
      }
    )

    test("when a cached user was deleted, it recreates the user", async () => {
      // Arrange
      const auth0Subject = "auth0|deleted-cached-user"
      const userData: Auth0UserInfo = {
        email: "deleted-cached-user@test.com",
        firstName: "Deleted",
        lastName: "Cached User",
        auth0Subject,
      }
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      const next: NextFunction = vi.fn()
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue(userData)

      await authorizationMiddleware(req as AuthorizationRequest, res as Response, next)
      await User.destroy({ where: { sub: auth0Subject } })

      // Act
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, next)

      // Assert
      const users = await User.findAll({ where: { sub: auth0Subject } })
      expect(users).toHaveLength(1)
    })
  })
})
