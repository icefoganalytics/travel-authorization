import { QueryTypes } from "@sequelize/core"

import db from "@/models"
import { withReportTransaction } from "@/services/downloads/with-report-transaction"

const STATEMENT_TIMEOUT_MS = 100

describe("api/src/services/downloads/with-report-transaction.ts", () => {
  describe("withReportTransaction", () => {
    test("when a statement exceeds the timeout, it cancels the statement and returns the connection", async () => {
      // Arrange
      const signal = new AbortController().signal
      const connectionsInUseBeforeReport = db.pool.using
      const longStatement = "SELECT pg_sleep(0.5)"

      // Act
      const error = await withReportTransaction(
        signal,
        async () => {
          await db.query(longStatement)
        },
        STATEMENT_TIMEOUT_MS
      ).catch((error: unknown) => error)

      // Assert
      expect({ error, connectionsInUse: db.pool.using }).toMatchObject({
        error: {
          message: "canceling statement due to statement timeout",
          sql: longStatement,
          cause: {
            code: "57014",
          },
        },
        connectionsInUse: connectionsInUseBeforeReport,
      })
    })

    test("when a statement finishes within the timeout, it returns rows to the report", async () => {
      // Arrange
      const signal = new AbortController().signal
      let rows: { value: number }[] = []

      // Act
      await withReportTransaction(
        signal,
        async () => {
          rows = await db.query<{ value: number }>("SELECT 1 AS value", {
            type: QueryTypes.SELECT,
          })
        },
        STATEMENT_TIMEOUT_MS
      )

      // Assert
      expect(rows).toEqual([
        {
          value: 1,
        },
      ])
    })

    test("when a report succeeds, it leaves the reused database session's timeout unchanged", async () => {
      // Arrange
      const signal = new AbortController().signal
      const sessionSettingsQuery = /* sql */ `
        SELECT
          pg_backend_pid() AS "backendId",
          current_setting('statement_timeout') AS "statementTimeout"
      `
      const sessionBeforeReport = await db.query(sessionSettingsQuery, {
        type: QueryTypes.SELECT,
      })

      // Act
      await withReportTransaction(
        signal,
        async () => {
          await db.query("SELECT 1")
        },
        STATEMENT_TIMEOUT_MS
      )

      // Assert
      // The pool reuses its last released connection. Compare the backend ID as well as the timeout.
      expect(await db.query(sessionSettingsQuery, { type: QueryTypes.SELECT })).toEqual(
        sessionBeforeReport
      )
    })
  })
})
