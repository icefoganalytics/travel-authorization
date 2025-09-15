import { Request, Response, NextFunction } from "express"

import { NODE_ENV } from "@/config"
import dbLegacy from "@/db/db-migration-client"
import db from "@/db/db-client"
import logger from "@/utils/logger"

let isDatabaseConnectionHealthly = false
let lastHealthCheckTime = 0

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes in milliseconds

function shouldPerformHealthCheck(
): boolean {
  return Date.now() - lastHealthCheckTime >= HEALTH_CHECK_INTERVAL
}

export async function databaseHealthCheckMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (isDatabaseConnectionHealthly && !shouldPerformHealthCheck()) {
    return next()
  }

  try {
    await dbLegacy.raw("SELECT 1")
    if (NODE_ENV !== "test") {
      logger.info("Legacy knex database connection has been established successfully.")
    }

    await db.authenticate()
    if (NODE_ENV !== "test") {
      logger.info("Sequelize database connection has been established successfully.")
    }

    isDatabaseConnectionHealthly = true
    lastHealthCheckTime = Date.now()

    return next()
  } catch (error) {
    logger.error(`Database health check failed with: ${error}`)
    isDatabaseConnectionHealthly = false
    res.status(503).json({ message: "Database health check failed." })
  }
}

export default databaseHealthCheckMiddleware
