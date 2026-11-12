import { QueryTypes, sql } from "@sequelize/core"

import travelAuthorizationDatabase from "@/models"
import BaseService from "@/services/base-service"

/** Serialize refreshes of one locator, including when no local events exist yet. */
export class WithSyncLockService extends BaseService {
  constructor(
    private readonly recordLocator: string,
    private readonly callback: () => Promise<void>
  ) {
    super()
  }

  async perform(): Promise<void> {
    await travelAuthorizationDatabase.transaction(async () => {
      const lockResource = `travel-authorization:booking-events:${this.recordLocator}`
      await travelAuthorizationDatabase.query(
        sql`
          SELECT pg_advisory_xact_lock(hashtext(${lockResource}));
        `,
        { type: QueryTypes.SELECT }
      )

      // PostgreSQL releases the lock when this transaction commits or rolls back.
      await this.callback()
    })
  }
}

export default WithSyncLockService
