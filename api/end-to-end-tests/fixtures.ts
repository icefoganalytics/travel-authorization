import { test as base } from "@playwright/test"

import cleanDatabase from "@/tests/support/clean-database"
import cleanTravComDatabase from "@/tests/support/clean-trav-com-database"

type AutoFixtures = { databaseSetup: void }

export const test = base.extend<AutoFixtures>({
  databaseSetup: [
    async ({ request: _request }, use) => {
      await cleanDatabase()
      await cleanTravComDatabase()
      await use()
    },
    { auto: true },
  ],
})
