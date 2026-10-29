import logger from "@/utils/logger"
import dbMigrationClient from "@/integrations/travelport-integration/db/db-migration-client"

export default async function runSeeds(): Promise<void> {
  if (process.env.SKIP_SEEDING_UNLESS_EMPTY === "true") {
    const [{ count }] = await dbMigrationClient("TravelOrderEvent").count("* as count")
    if (Number(count) > 0) return
  }

  const seeds = await dbMigrationClient.seed.run()
  logger.info(`Travelport seeds complete: ${seeds[0].length} run.`)
}
