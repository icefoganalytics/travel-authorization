import { IsolationLevel, QueryTypes } from "@sequelize/core"

import db from "@/models"

export async function withReportTransaction(
  signal: AbortSignal,
  generateRows: () => Promise<void>,
  statementTimeoutMs = DEFAULT_STATEMENT_TIMEOUT_MS
): Promise<void> {
  signal.throwIfAborted()

  await db.transaction(
    {
      isolationLevel: IsolationLevel.REPEATABLE_READ,
      readOnly: true,
    },
    async (transaction) => {
      signal.throwIfAborted()

      // PostgreSQL bounds each active statement without releasing the connection early.
      await db.query("SELECT set_config('statement_timeout', $statementTimeout, true)", {
        bind: { statementTimeout: `${statementTimeoutMs}ms` },
        transaction,
        type: QueryTypes.SELECT,
      })

      signal.throwIfAborted()
      await generateRows()
      signal.throwIfAborted()
    }
  )
}

const DEFAULT_STATEMENT_TIMEOUT_MS = 30_000

export default withReportTransaction
