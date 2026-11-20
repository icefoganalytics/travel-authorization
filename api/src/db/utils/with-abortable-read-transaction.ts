import { IsolationLevel } from "@sequelize/core"
import { Client } from "pg"

import db from "@/db/db-client"

export async function withAbortableReadTransaction(
  signal: AbortSignal,
  read: () => Promise<void>
): Promise<void> {
  signal.throwIfAborted()
  // Aborting closes the connection, so this utility must own the transaction.
  if (db.getCurrentClsTransaction()) {
    throw new Error("An abortable read transaction cannot run inside another transaction.")
  }

  await db.transaction(
    { isolationLevel: IsolationLevel.REPEATABLE_READ, readOnly: true },
    async (transaction) => {
      signal.throwIfAborted()
      const connection = transaction.getConnection()
      if (!(connection instanceof Client)) {
        throw new TypeError("An abortable read transaction requires a PostgreSQL client.")
      }

      // Let PostgreSQL detect a closed client even while a query is running.
      await db.query("SET LOCAL client_connection_check_interval = '1s'", { transaction })
      signal.throwIfAborted()

      const disconnect = () => {
        void connection.end()
      }
      signal.addEventListener("abort", disconnect, { once: true })
      try {
        await read()
        signal.throwIfAborted()
      } finally {
        signal.removeEventListener("abort", disconnect)
      }
    }
  )
}

export default withAbortableReadTransaction
