import { expressjwt as jwt, type Request as JwtRequest } from "express-jwt"
import { isNil } from "lodash"
import { NextFunction, Response } from "express"
import axios from "axios"
import jwksRsa, { type GetVerificationKey } from "jwks-rsa"

import { AUTH0_DOMAIN, AUTH0_AUDIENCE, NODE_ENV } from "@/config"
import logger from "@/utils/logger"
import { User } from "@/models"

if (NODE_ENV !== "test") {
  logger.info(`AUTH0_DOMAIN=${AUTH0_DOMAIN}/.well-known/jwks.json`)
}

export type AuthorizationRequest = JwtRequest & {
  user?: User
}

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,

  // Validate the audience and the issuer.
  audience: AUTH0_AUDIENCE,
  issuer: [`${AUTH0_DOMAIN}/`],
  algorithms: ["RS256"],
})

interface Auth0Response {
  sub: string // "auth0|6241ec44e5b4a700693df293"
  given_name: string // "Jane"
  family_name: string // "Doe"
  nickname: string // "Jane"
  name: string // "Jane Doe"
  picture: string // https://s.gravatar.com/avatar/1234567890abcdef1234567890abcdef?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fmb.png
  updated_at: string // "2023-10-30T17:25:52.975Z"
  email: string // "janedoe@gmail.com"
  email_verified: boolean // true
}

class Auth0PayloadError extends Error {
  constructor(data: unknown) {
    super(`Payload from Auth0 is strange or failed for: ${JSON.stringify(data)}`)
    this.name = "Auth0PayloadError"
  }
}

function findOrCreateUserFromAuth0Token(token: string): Promise<User> {
  logger.info("===== findOrCreateUserFromAuth0Token FUNC IS CALLED");
  return axios
    .get(`${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        authorization: token,
      },
    })
    .then(async ({ data }: { data: Auth0Response }) => {
      const sub = data.sub
      if (isNil(sub)) {
        throw new Auth0PayloadError(data)
      }

      const { email, given_name: firstName, family_name: lastName } = data

      const fallbackEmail = `${firstName}.${lastName}@yukon-no-email.ca`
      
      const user = await User.findOne({ where: { sub } });
      
      if(user){
          return user;
      } else {
          const created = await User.create({
            sub,
            email: email || fallbackEmail,
            firstName,
            lastName,
            roles: [User.Roles.USER],
            status: User.Statuses.ACTIVE,
          });
          
          if (created) {
            logger.info(`CREATED USER FOR ${email}: ${JSON.stringify(created.dataValues)}`);
          }
          return created;
      }
      /*
      const [user, created] = await User.findOrCreate({
        where: { sub },
        defaults: {
          sub,
          email: email || fallbackEmail,
          firstName,
          lastName,
          roles: [User.Roles.USER],
          status: User.Statuses.ACTIVE,
        },
      })
      return user
      */
    })
}

export async function loadUser(req: AuthorizationRequest, res: Response, next: NextFunction) {
  const sub = req.auth?.sub // from express-jwt

  const user = await User.findOne({ where: { sub } })
  if (user !== null) {
    console.log("========== Found auth0user, returning.")
    req.user = user
    return next()
  }
  console.log("====== Trying to find again")
  const token = req.headers.authorization || ""
  return findOrCreateUserFromAuth0Token(token)
    .then((user) => {
      req.user = user
      return next()
    })
    .catch((error) => {
      if (error instanceof Auth0PayloadError) {
        logger.info(error)
        return res.status(502).json({ message: "External authorization api failed." })
      } else {
        return res.status(401).json({ message: "User authentication failed." })
      }
    })
}
