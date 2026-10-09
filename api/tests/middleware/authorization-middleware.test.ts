import { Response, NextFunction } from "express"
import { User } from "@/models"
import { auth0Integration, type Auth0UserInfo } from "@/integrations/auth0-integration"
import { userFactory } from "@/factories"
import {
  authorizationMiddleware,
  type AuthorizationRequest,
} from "@/middleware/authorization-middleware"

vi.unmock("@/middleware/authorization-middleware")

vi.mock("@/integrations/auth0-integration")
vi.mock("@/utils/logger")

describe("api/src/middleware/authorization-middleware.ts", () => {
  describe(".authorizationMiddleware", () => {
    test("when concurrent tokens authenticate the same subject, one user identity persists", async () => {
      // Arrange
      const attempts = 100
      const auth0Subject = "auth0|concurrent-creation"
      const userData: Auth0UserInfo = {
        email: "dupe@test.com",
        firstName: "dupe",
        lastName: "UNKNOWN",
        auth0Subject,
      }
      const requests: Partial<AuthorizationRequest>[] = Array.from(
        { length: attempts },
        (_, index) => ({
          headers: { authorization: `Bearer concurrent-token-${index}` },
          auth: { sub: auth0Subject },
        })
      )
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      const next: NextFunction = vi.fn()
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue(userData)

      // Act
      await Promise.all(
        requests.map((request) =>
          authorizationMiddleware(request as AuthorizationRequest, res as Response, next)
        )
      )

      // Assert
      const users = await User.findAll({ where: { sub: auth0Subject } })
      expect(users).toEqual([expect.objectContaining({ sub: auth0Subject })])
    })

    test("when concurrent tokens authenticate the same subject, every request attaches the persisted user", async () => {
      // Arrange
      const attempts = 100
      const auth0Subject = "auth0|concurrent-request-identity"
      const requests: Partial<AuthorizationRequest>[] = Array.from(
        { length: attempts },
        (_, index) => ({
          headers: { authorization: `Bearer concurrent-token-${index}` },
          auth: { sub: auth0Subject },
        })
      )
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue({
        auth0Subject,
        email: "concurrent-request-identity@test.com",
        firstName: "Concurrent",
        lastName: "Identity",
      })

      // Act
      await Promise.all(
        requests.map((request) =>
          authorizationMiddleware(request as AuthorizationRequest, res as Response, vi.fn())
        )
      )

      // Assert
      const user = await User.findOne({ where: { sub: auth0Subject } })
      if (user === null) {
        throw new Error("Concurrent requests did not persist their authenticated user.")
      }
      expect(requests.map((request) => request.user?.id)).toEqual(
        Array.from({ length: attempts }, () => user.id)
      )
    })

    test("when a previously created user was deleted, it recreates the authenticated user", async () => {
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
      const nextRequest: Partial<AuthorizationRequest> = {
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }
      await authorizationMiddleware(nextRequest as AuthorizationRequest, res as Response, next)

      // Assert
      expect(nextRequest.user).toEqual(expect.objectContaining({ sub: auth0Subject }))
    })

    test("when another account reuses a deleted user's ID, the persisted user retains the original identity and permissions", async () => {
      // Arrange
      const auth0Subject = "auth0|recycled-user-id"
      const userData: Auth0UserInfo = {
        email: "recycled-user-id@test.com",
        firstName: "Recycled",
        lastName: "User ID",
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
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue(userData)
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())
      const user1 = req.user
      if (user1 === undefined) {
        throw new Error("Initial request did not authenticate a user.")
      }

      await User.destroy({ where: { id: user1.id }, force: true })
      await userFactory.create({
        id: user1.id,
        sub: "auth0|replacement-admin",
        roles: [User.Roles.ADMIN],
      })
      const requests: Partial<AuthorizationRequest>[] = Array.from({ length: 20 }, () => ({
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }))

      // Act
      await Promise.all(
        requests.map((request) =>
          authorizationMiddleware(request as AuthorizationRequest, res as Response, vi.fn())
        )
      )

      // Assert
      const users = await User.findAll({ where: { sub: auth0Subject } })
      expect(users).toEqual([
        expect.objectContaining({ sub: auth0Subject, roles: [User.Roles.USER] }),
      ])
    })

    test("when another account reuses a deleted user's ID, concurrent requests attach the recreated user's identity and permissions", async () => {
      // Arrange
      const auth0Subject = "auth0|recycled-request-identity"
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue({
        auth0Subject,
        email: "recycled-request-identity@test.com",
        firstName: "Recycled",
        lastName: "Identity",
      })
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())
      const user1 = req.user
      if (user1 === undefined) {
        throw new Error("Initial request did not authenticate a user.")
      }

      await User.destroy({ where: { id: user1.id }, force: true })
      await userFactory.create({
        id: user1.id,
        sub: "auth0|replacement-admin",
        roles: [User.Roles.ADMIN],
      })
      const requests: Partial<AuthorizationRequest>[] = Array.from({ length: 20 }, () => ({
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }))

      // Act
      await Promise.all(
        requests.map((request) =>
          authorizationMiddleware(request as AuthorizationRequest, res as Response, vi.fn())
        )
      )

      // Assert
      const user2 = await User.findOne({ where: { sub: auth0Subject } })
      if (user2 === null) {
        throw new Error("Concurrent requests did not recreate their authenticated user.")
      }
      expect(requests.map((request) => request.user)).toEqual(
        Array.from({ length: requests.length }, () =>
          expect.objectContaining({
            id: user2.id,
            sub: auth0Subject,
            roles: [User.Roles.USER],
          })
        )
      )
    })

    test("when user creation fails, it responds unauthorized", async () => {
      // Arrange
      const auth0Subject = "auth0|failed-creation"
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }
      let status: number | undefined
      const res: Partial<Response> = {
        status: vi.fn((statusCode: number) => {
          status = statusCode
          return res as Response
        }),
        json: vi.fn(),
      }
      vi.spyOn(auth0Integration, "getUserInfo").mockRejectedValue(
        new Error("Auth0 temporarily unavailable")
      )

      // Act
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())

      // Assert
      expect(status).toEqual(401)
    })

    test("when user creation fails, a later request can authenticate after recovery", async () => {
      // Arrange
      const auth0Subject = "auth0|retry-creation"
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: auth0Subject },
        auth: { sub: auth0Subject },
      }
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      const userInfo = vi.spyOn(auth0Integration, "getUserInfo")
      userInfo.mockRejectedValueOnce(new Error("Auth0 temporarily unavailable"))
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())
      userInfo.mockResolvedValue({
        auth0Subject,
        email: "retry-creation@test.com",
        firstName: "Retry",
        lastName: "Creation",
      })

      // Act
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())

      // Assert
      expect(req.user).toEqual(expect.objectContaining({ sub: auth0Subject }))
    })

    test("when Auth0 returns another subject, it responds unauthorized", async () => {
      // Arrange
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: "different-subject-token" },
        auth: { sub: "auth0|expected-subject" },
      }
      let status: number | undefined
      const res: Partial<Response> = {
        status: vi.fn((statusCode: number) => {
          status = statusCode
          return res as Response
        }),
        json: vi.fn(),
      }
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue({
        auth0Subject: "auth0|unexpected-subject",
        email: "unexpected-subject@test.com",
        firstName: "Unexpected",
        lastName: "Subject",
      })

      // Act
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())

      // Assert
      expect(status).toEqual(401)
    })

    test("when Auth0 returns another subject, it does not forward the request", async () => {
      // Arrange
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: "different-subject-token" },
        auth: { sub: "auth0|expected-subject" },
      }
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      const next: NextFunction = vi.fn()
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue({
        auth0Subject: "auth0|unexpected-subject",
        email: "unexpected-subject@test.com",
        firstName: "Unexpected",
        lastName: "Subject",
      })

      // Act
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, next)

      // Assert
      expect(next).not.toHaveBeenCalled()
    })

    test("when Auth0 returns another subject, it does not attach that user's identity", async () => {
      // Arrange
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: "different-subject-token" },
        auth: { sub: "auth0|expected-subject" },
      }
      const res: Partial<Response> = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      vi.spyOn(auth0Integration, "getUserInfo").mockResolvedValue({
        auth0Subject: "auth0|unexpected-subject",
        email: "unexpected-subject@test.com",
        firstName: "Unexpected",
        lastName: "Subject",
      })

      // Act
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, vi.fn())

      // Assert
      expect(req.user).toEqual(undefined)
    })
  })
})
