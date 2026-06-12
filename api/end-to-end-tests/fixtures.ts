import { test as base, expect } from "@playwright/test"

import cleanDatabase from "@/tests/support/clean-database"
import cleanTravComDatabase from "@/tests/support/clean-trav-com-database"

type AutoFixtures = { databaseSetup: void }

export const test = base.extend<AutoFixtures>({
  databaseSetup: [
    async ({}, use) => {
      await cleanDatabase()
      await cleanTravComDatabase()
      await use()
    },
    { auto: true },
  ],
})

export { expect }
