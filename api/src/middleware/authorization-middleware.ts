import { type NextFunction, type Response } from "express"
import { type Request as JwtRequest } from "express-jwt"
import { isNil } from "lodash"

import logger from "@/utils/logger"
import { User } from "@/models"

import auth0Integration, { Auth0PayloadError } from "@/integrations/auth0-integration"

export type AuthorizationRequest = JwtRequest & {
  user?: User
}

export type AuthorizedRequest = AuthorizationRequest & {
  user: User
}

const userCreationPromises = new Map<string, Promise<User>>()

export async function ensureUserFromAuth0Token(token: string): Promise<User> {
  const { auth0Subject, email, firstName, lastName } = await auth0Integration.getUserInfo(token)
  const user = await User.findOne({ where: { sub: auth0Subject } })

  if (!isNil(user)) {
    return user
  }

  const newUser = await User.create({
    sub: auth0Subject,
    email: email,
    firstName: firstName,
    lastName: lastName,
    roles: [User.Roles.USER],
    status: User.Statuses.ACTIVE,
  })

  logger.info(`CREATED USER FOR ${email}: ${JSON.stringify(newUser.dataValues)}`)
  return newUser
}

export async function authorizationMiddleware(
  req: AuthorizationRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization || ""

  // Step 1: check database for user
  const user = await User.findOne({ where: { sub: req.auth?.sub } })

  if (!isNil(user)) {
    req.user = user
    return next()
  }

  let userCreationPromise = userCreationPromises.get(token)

  try {
    if (isNil(userCreationPromise)) {
      userCreationPromise = ensureUserFromAuth0Token(token)
      userCreationPromises.set(token, userCreationPromise)
    }

    const createdUser = await userCreationPromise
    if (createdUser.sub !== req.auth?.sub) {
      throw new Error("Created user does not match the authenticated subject.")
    }

    req.user = createdUser
    return next()
  } catch (error) {
    if (error instanceof Auth0PayloadError) {
      logger.info(error)
      return res.status(502).json({ message: "External authorization api failed." })
    } else {
      return res.status(401).json({ message: "User authentication failed." })
    }
  } finally {
    if (userCreationPromises.get(token) === userCreationPromise) {
      userCreationPromises.delete(token)
    }
  }
}

export default authorizationMiddleware
