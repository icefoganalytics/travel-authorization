import { Router, type Request, type Response } from "express"

import dbLegacy from "@/db/db-migration-client"
import logger from "@/utils/logger"

export const migrateRouter = Router()

migrateRouter.get("/migrate/up", async (_req: Request, res: Response) => {
  logger.info("-------- MIGRATE UP ---------")
  return dbLegacy.migrate
    .up()
    .then((result) => {
      return res.json(result)
    })
    .catch((error) => {
      res.status(422).json({ message: `Failed to migrate: ${error}` })
    })
})

migrateRouter.get("/migrate/down", async (_req: Request, res: Response) => {
  logger.info("-------- MIGRATE DOWN ---------")
  return dbLegacy.migrate
    .down()
    .then((result) => {
      return res.json(result)
    })
    .catch((error) => {
      res.status(422).json({ message: `Failed to migrate: ${error}` })
    })
})

migrateRouter.get("/migrate/latest", async (_req: Request, res: Response) => {
  logger.info("-------- MIGRATE LATEST ---------")
  return dbLegacy.migrate
    .latest()
    .then((result) => {
      return res.json(result)
    })
    .catch((error) => {
      res.status(422).json({ message: `Failed to migrate: ${error}` })
    })
})

migrateRouter.get("/migrate/seed", async (_req: Request, res: Response) => {
  logger.info("-------- MIGRATE SEED ---------")
  return dbLegacy.seed
    .run()
    .then((result) => {
      return res.json(result)
    })
    .catch((error) => {
      res.status(422).json({ message: `Failed to seed: ${error}` })
    })
})
