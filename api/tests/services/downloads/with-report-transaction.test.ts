import { QueryTypes } from "@sequelize/core"

import db from "@/models"
import withReportTransaction from "@/services/downloads/with-report-transaction"

const STATEMENT_TIMEOUT_MS = 100

describe("api/src/services/downloads/with-report-transaction.ts", () => {
  describe("withReportTransaction", () => {
    test("when a statement exceeds the timeout, PostgreSQL cancels it", async () => {
      // Arrange
      const signal = new AbortController().signal
      const longStatement = "SELECT pg_sleep(0.5)"

      // Act
      const report = withReportTransaction(
        signal,
        async () => {
          await db.query(longStatement)
        },
        STATEMENT_TIMEOUT_MS
      )

      // Assert
      await expect(report).rejects.toMatchObject({
        sql: longStatement,
        cause: {
          code: "57014",
        },
      })
    })

    test("when PostgreSQL cancels a pending statement, the pool recovers the connection", async () => {
      // Arrange
      const connectionsInUseBeforeReport = db.pool.using
      const signal = new AbortController().signal

      // Act
      const report = withReportTransaction(signal, async () => {
        await db.query("SELECT pg_sleep(0.5)")
      }, STATEMENT_TIMEOUT_MS)
      await Promise.allSettled([report])

      // Assert
      expect(db.pool.using).toBe(connectionsInUseBeforeReport)
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
