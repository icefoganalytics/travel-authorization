import knex, { type Knex } from "knex"

import {
  DB_HEALTH_CHECK_INTERVAL_SECONDS,
  DB_HEALTH_CHECK_RETRIES,
  DB_HEALTH_CHECK_START_PERIOD_SECONDS,
  DB_HEALTH_CHECK_TIMEOUT_SECONDS,
} from "@/config"
import logger from "@/utils/logger"
import sleep from "@/utils/sleep"
import { isCredentialFailure, isSocketFailure } from "@/utils/db-error-helpers"
import { buildKnexConfig } from "@/integrations/travelport-integration/db/db-migration-client"

async function checkHealth(client: Knex, timeoutSeconds: number): Promise<void> {
  const query = client.raw("SELECT 1")
  const timeout = sleep(timeoutSeconds).then(() => {
    throw new Error("Connection timeout")
  })
  await Promise.race([query, timeout])
}

export async function waitForDatabase(): Promise<void> {
  await sleep(DB_HEALTH_CHECK_START_PERIOD_SECONDS)
  let client = knex(buildKnexConfig())
  let serverReady = false

  for (let attempt = 0; attempt < DB_HEALTH_CHECK_RETRIES; attempt += 1) {
    try {
      await checkHealth(client, DB_HEALTH_CHECK_TIMEOUT_SECONDS)
      await client.destroy()
      logger.info("Travelport database connection successful.")
      return
    } catch (error) {
      if (isSocketFailure(error)) {
        logger.info(`Travelport database socket is not ready, retrying... ${error}`, { error })
        await sleep(DB_HEALTH_CHECK_INTERVAL_SECONDS)
        continue
      }
      if (isCredentialFailure(error) && !serverReady) {
        serverReady = true
        await client.destroy()
        client = knex(buildKnexConfig({ connection: { database: "" } }))
        attempt -= 1
        continue
      }
      await client.destroy()
      throw error
    }
  }

  await client.destroy()
  throw new Error("Failed to connect to Travelport database due to timeout.")
}

export default waitForDatabase
