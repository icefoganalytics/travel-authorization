import { type NextFunction, type Response } from "express"
import { type Request as JwtRequest } from "express-jwt"
import { isNil } from "lodash"

import logger from "@/utils/logger"
import { User } from "@/models"

import auth0Integration, { Auth0PayloadError } from "@/integrations/auth0-integration"

import NodeCache from "node-cache"

export type AuthorizationRequest = JwtRequest & {
  user?: User
}

export type AuthorizedRequest = AuthorizationRequest & {
  user: User
}

interface CachedUser {
  promise: Promise<User>
  timestamp: number
}

const userCache = new NodeCache({ stdTTL: 60, checkperiod: 60 })

export async function ensureUserFromAuth0Token(token: string): Promise<User> {
  const { auth0Subject, email, firstName, lastName } = await auth0Integration.getUserInfo(token)
  const user = await User.findOne({ where: { sub: auth0Subject } })

  if (!isNil(user)) {
    return user
  }

  const existingUser = await User.findOne({
    where: { sub: auth0Subject },
  })

  if (existingUser) {
    return existingUser
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

  // Step 2: use the in-flight creation cache only while it still represents a persisted user.
  const cachedUser = userCache.get(token) as CachedUser

  if (cachedUser) {
    const resolvedUser = await cachedUser.promise
    const persistedUser = await User.findByPk(resolvedUser.id)
    if (!isNil(persistedUser)) {
      req.user = persistedUser
      return next()
    }

    userCache.del(token)
  }

  try {
    const userCreationPromise = ensureUserFromAuth0Token(token)
    userCache.set(token, { promise: userCreationPromise, timestamp: Date.now() })

    req.user = await userCreationPromise
    return next()
  } catch (error) {
    if (error instanceof Auth0PayloadError) {
      logger.info(error)
      return res.status(502).json({ message: "External authorization api failed." })
    } else {
      return res.status(401).json({ message: "User authentication failed." })
    }
  }
}

export default authorizationMiddleware
