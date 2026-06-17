import { test as base } from "playwright/test"

import cleanDatabase from "@/tests/support/clean-database"
import cleanTravComDatabase from "@/tests/support/clean-trav-com-database"

// Re-export the full public surface of @playwright/test so that test files
// importing from "@playwright/test" (which tsconfig.test.json remaps here)
// can still access expect, Page, Browser, etc. without a separate import.
export * from "playwright/test"

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
