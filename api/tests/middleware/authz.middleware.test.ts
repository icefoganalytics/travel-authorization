//import { Express } from "express"
import { loadUser } from "@/middleware"
import { AuthorizationRequest } from "@/middleware/authz.middleware"
import { type NextFunction, type Response } from "express"

describe("api/src/middleware/authz.middleware.ts", () => {
  describe(".loadUser", () => {
    test("When loadUser middleware is ran and user is found, add user to reqest object", async () => {
      const request = {
        auth: {
          sub: 'auth0|666b9ecd34980d06fe647645'
        }
      } as AuthorizationRequest

      const response = {} as Response

      const next = {} as NextFunction;

      loadUser(request, response, next);
    })
  })
})
