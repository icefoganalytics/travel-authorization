import { test as base } from "@playwright/test"

import cleanDatabase from "@/tests/support/clean-database"
import cleanTravComDatabase from "@/tests/support/clean-trav-com-database"

type EndToEndFixtures = {
  preserveDatabase: boolean
  databaseSetup: void
}

export async function cleanEndToEndDatabases() {
  const databaseCleaned = await cleanDatabase()
  const travComDatabaseCleaned = await cleanTravComDatabase()

  if (!databaseCleaned || !travComDatabaseCleaned) {
    throw new Error("End-to-end test database cleanup failed")
  }
}

export const test = base.extend<EndToEndFixtures>({
  preserveDatabase: [false, { option: true }],
  databaseSetup: [
    async ({ preserveDatabase }, use) => {
      if (!preserveDatabase) await cleanEndToEndDatabases()

      await use()
    },
    { auto: true },
  ],
})
