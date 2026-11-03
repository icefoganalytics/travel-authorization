import knex from "knex"

import { TRAVELPORT_DB_NAME } from "@/config"
import { buildKnexConfig } from "@/integrations/travelport-integration/db/db-migration-client"

export default async function ensureDatabase(): Promise<void> {
  const client = knex(buildKnexConfig({ connection: { database: "" } }))
  try {
    const result = await client.raw("SELECT 1 FROM sys.databases WHERE name = ?", [
      TRAVELPORT_DB_NAME,
    ])
    if (result.length === 0) {
      await client.raw("CREATE DATABASE ??", [TRAVELPORT_DB_NAME])
    }
  } finally {
    await client.destroy()
  }
}
