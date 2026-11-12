import logger from "@/utils/logger"
import dbMigrationClient from "@/integrations/travel-port-integration/db/db-migration-client"

export async function runMigrations(): Promise<void> {
  const migrations = await dbMigrationClient.migrate.latest()
  logger.info(`Travelport migrations complete: ${migrations[1].length} run.`)
}

export default runMigrations
