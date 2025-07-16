import knex from "@/db/db-migration-client"
import logger from "@/utils/logger"

type MigrationInfo = {
  file: string
  directory: string
}

async function runMigrations(): Promise<void> {
  const [_completedMigrations, pendingMigrations]: [MigrationInfo[], MigrationInfo[]] =
    await knex.migrate.list()

  if (pendingMigrations.length === 0) {
    logger.info("No pending migrations.")
    return
  }

  return pendingMigrations
    .reduce(async (previousMigration, { file, directory }) => {
      await previousMigration

      logger.info(`Running migration: ${directory}/${file}`)
      return knex.migrate.up()
    }, Promise.resolve())
    .then(() => {
      logger.info("All migrations completed successfully.")
    })
    .catch((error) => {
      logger.error(`Error running migrations: ${error}`, { error })
      throw error
    })
}

export default runMigrations
