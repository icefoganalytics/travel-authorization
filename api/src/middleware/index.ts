import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"

import { User } from "@/models"

export { authorizationMiddleware } from "./authorization-middleware"
export { betterFormDataBodyParserMiddleware } from "./better-form-data-body-parser-middleware"
export { bodyAuthorizationHoistMiddleware } from "./body-authorization-hoist-middleware"
export { databaseHealthCheckMiddleware } from "./database-health-check-middleware"
export { jwtMiddleware } from "./jwt-middleware"
export { requestLoggerMiddleware } from "./request-logger-middleware"

/** @deprecated - prefer serializer pattern */
export function ReturnValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    })
  }

  next()
}

/** @deprecated - prefer secure by default; everything requires auth unless explicity excluded from authorization check. */
export function RequiresAuth(_req: Request, _res: Response, next: NextFunction) {
  // if (req.isAuthenticated()) {
  return next()
  // }

  // res.redirect("/api/auth/login");
}

/** @deprecated - prefer policy pattern */
export function RequiresRolePatAdminOrAdmin(req: Request, res: Response, next: NextFunction) {
  const isAdmin =
    "user" in req && req.user instanceof User && req.user.roles.includes(User.Roles.ADMIN)
  const isPreApprovedTravelAdmin =
    "user" in req &&
    req.user instanceof User &&
    req.user.roles.includes(User.Roles.PRE_APPROVED_TRAVEL_ADMIN)

  if (isAdmin || isPreApprovedTravelAdmin) {
    return next()
  }

  return res.status(401).send("You are not an Administrator for Pre-Approval Travel Requests!")
}

/** @deprecated - prefer policy pattern */
export function RequiresRoleTdUser(req: Request, res: Response, next: NextFunction) {
  const isTravelDeskUser =
    "user" in req &&
    req.user instanceof User &&
    req.user.roles.includes(User.Roles.TRAVEL_DESK_USER)

  if (isTravelDeskUser) {
    return next()
  }

  return res.status(401).send("You are not a Travel Desk User!")
}
