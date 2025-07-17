import { isNull, pick } from "lodash"
import { Op } from "@sequelize/core"
import express, { Request, Response } from "express"

import logger from "@/utils/logger"
import { RequiresRoleTdUser } from "@/middleware"
import { AuthorizedRequest } from "@/middleware/authorization-middleware"
import { User } from "@/models"
import { YkGovernmentDirectorySyncService } from "@/services"
import { UsersSerializer } from "@/serializers"

export const userRouter = express.Router()

userRouter.get("/me", async (req: Request, res: Response) => {
  console.warn(
    "Deprecated: prefer /api/current-user (api/src/controllers/current-user-controller.ts) instead"
  )
  const user = (req as AuthorizedRequest).user

  // See api/src/controllers/users/yg-government-directory-sync-controller.ts for force sync endpoint
  if (!user.isTimeToSyncWithEmployeeDirectory()) {
    const serializedUser = UsersSerializer.asDetailed(user)
    return res.status(200).json({ user: serializedUser })
  }

  return YkGovernmentDirectorySyncService.perform(user).then((user) => {
    const serializedUser = UsersSerializer.asDetailed(user)
    return res.status(200).json({ user: serializedUser })
  })
})

userRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll()
    res.status(200).json(users)
  } catch (error: unknown) {
    logger.info(error)
    res.status(500).json("Internal Server Error")
  }
})

userRouter.get("/travel-desk-users", RequiresRoleTdUser, async (_req: Request, res: Response) => {
  try {
    // TODO: update the front-end so renaming is no longer needed
    const users = await User.findAll({
      attributes: ["email", "firstName", "lastName"],
      where: {
        status: User.Statuses.ACTIVE,
        roles: {
          [Op.contains]: [User.Roles.TRAVEL_DESK_USER],
        },
      },
    })

    res.status(200).json(users)
  } catch (error: unknown) {
    logger.info(error)
    res.status(500).json("Internal Server Error")
  }
})

userRouter.put(
  "/:id/permissions",
  /* RequiresRoleAdmin, */ async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const userAttributes = pick(req.body, ["firstName", "lastName", "department", "roles"])
      await User.update(userAttributes, { where: { id: userId } })
      res.status(200).json("Saved permissions")
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

userRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (isNull(user)) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error: unknown) {
    logger.info(error)
    res.status(500).json("Internal Server Error")
  }
})
