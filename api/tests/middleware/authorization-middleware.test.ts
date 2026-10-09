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
      expect({
        persistedUsers: users,
        attachedUserIds: requests.map((request) => request.user?.id),
      }).toEqual({
        persistedUsers: [expect.objectContaining({ sub: auth0Subject })],
        attachedUserIds: Array.from({ length: attempts }, () => users[0]?.id),
      })
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

    test("when another account reuses a deleted user's ID, concurrent requests retain the original identity", async () => {
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
      expect({
        persistedUsers: users,
        attachedUsers: requests.map((request) => request.user),
      }).toEqual({
        persistedUsers: [expect.objectContaining({ sub: auth0Subject, roles: [User.Roles.USER] })],
        attachedUsers: Array.from({ length: requests.length }, () =>
          expect.objectContaining({ sub: auth0Subject, roles: [User.Roles.USER] })
        ),
      })
    })

    test("when user creation fails, a later request can authenticate after recovery", async () => {
      // Arrange
      const auth0Subject = "auth0|retry-creation"
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
      expect({ initialStatus: status, authenticatedUser: req.user }).toEqual({
        initialStatus: 401,
        authenticatedUser: expect.objectContaining({ sub: auth0Subject }),
      })
    })

    test("when Auth0 returns another subject, the request is not authenticated", async () => {
      // Arrange
      const req: Partial<AuthorizationRequest> = {
        headers: { authorization: "different-subject-token" },
        auth: { sub: "auth0|expected-subject" },
      }
      let status: number | undefined
      let forwarded = false
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
      await authorizationMiddleware(req as AuthorizationRequest, res as Response, () => {
        forwarded = true
      })

      // Assert
      expect({ status, forwarded, attachedUser: req.user }).toEqual({
        status: 401,
        forwarded: false,
        attachedUser: undefined,
      })
    })
  })
})
