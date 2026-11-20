import { IsolationLevel } from "@sequelize/core"
import { type PostgresConnection } from "@sequelize/postgres"

import db from "@/models"

export class WithReportTransaction {
  static async perform(signal: AbortSignal, generateRows: () => Promise<void>): Promise<void> {
    signal.throwIfAborted()

    await db.transaction(
      {
        isolationLevel: IsolationLevel.REPEATABLE_READ,
        readOnly: true,
      },
      async (transaction) => {
        signal.throwIfAborted()

        // PostgreSQL checks for a closed client even while a statement is still executing.
        await db.query("SET LOCAL client_connection_check_interval = '1s'", { transaction })
        signal.throwIfAborted()

        const connection = transaction.getConnection() as PostgresConnection
        const disconnect = () => {
          void connection.end()
        }
        signal.addEventListener("abort", disconnect, { once: true })
        try {
          await generateRows()
          signal.throwIfAborted()
        } finally {
          signal.removeEventListener("abort", disconnect)
        }
      }
    )
  }
}

export default WithReportTransaction
