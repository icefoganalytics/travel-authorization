import knex from "@/db/db-client-legacy"
import { TravelAuthorization } from "@/models"
import logger from "@/utils/logger"

async function runSeeds(force = false): Promise<void> {
  if (process.env.SKIP_SEEDING_UNLESS_EMPTY === "true" && force !== true) {
    const count = await TravelAuthorization.count()
    if (count > 0) {
      logger.info("Skipping seeding as SKIP_SEEDING_UNLESS_EMPTY set, and data already seeded.")
      return
    }
  }

  return knex.seed
    .run()
    .then(() => {
      logger.info("All seeds completed successfully.")
    })
    .catch((error) => {
      logger.error(`Error running seeds: ${error}`, { error })
      throw error
    })
}

export default runSeeds

// Run via `dev ts-node ./src/initializers/30-run-seeds.ts`
if (require.main === module) {
  ;(async () => {
    try {
      await runSeeds(true)
    } catch {
      logger.error("Failed to complete initialization!")
    }

    process.exit(0)
  })()
}
