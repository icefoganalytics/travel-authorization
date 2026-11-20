import { randomUUID } from "node:crypto"

import { QueryTypes } from "@sequelize/core"

import db from "@/models"
import { Downloads } from "@/services"

describe("WithReportTransaction.perform", () => {
  test("when a download remains connected, it inherits the database statement timeout", async () => {
    // Arrange
    const readTimeout = () => db.query("SHOW statement_timeout", { type: QueryTypes.SELECT })
    const expected = await readTimeout()
    let observed

    // Act
    await Downloads.WithReportTransaction.perform(new AbortController().signal, async () => {
      observed = await readTimeout()
    })

    // Assert
    expect(observed).toEqual(expected)
  })

  test("when a download aborts during SQL, PostgreSQL closes the transaction and the pool recovers", async () => {
    // Arrange
    const controller = new AbortController()
    const baseline = db.pool.using
    const sleep = `SELECT pg_sleep(60) /* report ${randomUUID()} */`
    const findReport = () => db.query<{ pid: number }>(
      "SELECT pid FROM pg_stat_activity WHERE query = $sleep AND state = 'active'",
      { bind: { sleep }, type: QueryTypes.SELECT }
    )
    const report = Downloads.WithReportTransaction.perform(controller.signal, async () => {
      await db.query(sleep)
    })
    const completed = Promise.allSettled([report])
    try {
      const pid = await vi.waitFor(async () => {
        const [session] = await findReport()
        if (!session) throw new Error("Report query is not active yet")
        return session.pid
      }, { timeout: 5000 })

      // Act
      controller.abort()
      const [outcome] = await completed

      // Assert
      await vi.waitFor(async () => {
        const sessions = await db.query("SELECT pid FROM pg_stat_activity WHERE pid = $pid", {
          bind: { pid },
          type: QueryTypes.SELECT,
        })
        expect({ outcome: outcome.status, connections: db.pool.using, sessions }).toEqual({
          outcome: "rejected",
          connections: baseline,
          sessions: [],
        })
      }, { timeout: 5000 })
    } finally {
      controller.abort()
      await completed
    }
  })
})
