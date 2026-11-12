import { QueryTypes, sql } from "@sequelize/core"

import travelAuthorizationDatabase from "@/models"
import BaseService from "@/services/base-service"

/**
 * Runs the callback inside a local database transaction while holding the booking
 * synchronization lock for the supplied record locator.
 *
 * Another refresh using this service for the same locator waits until the first
 * transaction commits or rolls back. This prevents concurrent refreshes from
 * interleaving event updates and deletion of unmatched events.
 *
 * The PostgreSQL advisory lock uses a locator-derived key rather than a row lock,
 * so it also protects the first refresh, before any local booking events exist.
 * It coordinates callers of this service; it does not lock the remote Travelport feed.
 */
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
