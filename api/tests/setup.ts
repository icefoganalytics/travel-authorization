/**
 * See https://vitest.dev/config/#setupfiles
 *
 * Run some code before each test file.
 *
 * WARNING: Be very careful of imports in this file!!!
 * Vitest will not mock modules that were imported inside a setup file because they are
 * cached by the time a test file is running.
 * You can do
 * ```ts
 * vi.hoisted(() => {
 *   vi.resetModules()
 * })
 * ```
 * to clear all module caches before running a test file.
 * See: https://vitest.dev/api/vi#vi-mock
 */

import { QueryTypes } from "@sequelize/core"
import { isNil } from "lodash"

import db from "@/db/db-client"

// Global Mocks
import { mockedAxios } from "@/support/mock-axios"

async function getTableNames() {
  const query = `
    SELECT table_name as "tableName"
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name != 'SequelizeMeta'
    AND table_name != 'knex_migrations'
    AND table_name != 'knex_migrations_lock';
  `

  try {
    const result = await db.query<{ tableName: string }>(query, { type: QueryTypes.SELECT })
    const tableNames = result.map((row) => row.tableName)
    return tableNames
  } catch (error) {
    console.error("Error fetching table names:", error)
    throw error
  }
}

let truncateQuery: string | null = null

async function cleanDatabase() {
  if (isNil(truncateQuery)) {
    const tableNames = await getTableNames()
    const quotedTableNames = tableNames.map((name) => `"${name}"`)
    truncateQuery = `
    TRUNCATE TABLE
      ${quotedTableNames.join(",\n      ")}
    RESTART IDENTITY
    CASCADE;
  `
  }

  try {
    // TODO: once all tables are in Sequelize models, use this instead:
    // await db.truncate({ cascade: true, restartIdentity: true })
    await db.query(truncateQuery, { raw: true })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

beforeEach(async () => {
  await cleanDatabase()
})

afterEach(() => {
  mockedAxios.reset()
})
