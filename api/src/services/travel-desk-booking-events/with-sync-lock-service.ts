import { QueryTypes, sql } from "@sequelize/core"

import db from "@/models"
import BaseService from "@/services/base-service"

/**
 * Runs the callback inside a local database transaction while holding the booking
 * synchronization lock for the supplied booking reference.
 *
 * Another refresh using this service for the same booking reference waits until the first
 * transaction commits or rolls back. This prevents concurrent refreshes from
 * interleaving event updates and deletion of unmatched events.
 *
 * The PostgreSQL advisory lock uses a booking-reference-derived key rather than a row lock,
 * so it also protects the first refresh, before any local booking events exist.
 * It coordinates callers of this service; it does not lock the remote Travelport feed.
 */
export class WithSyncLockService extends BaseService {
  constructor(
    private readonly bookingReference: string,
    private readonly callback: () => Promise<void>
  ) {
    super()
  }

  async perform(): Promise<void> {
    await db.transaction(async () => {
      const lockResource = `travel-authorization:booking-events:${this.bookingReference}`
      await db.query(
        sql`
          SELECT pg_advisory_xact_lock(hashtext(${lockResource}));
        `,
        { type: QueryTypes.SELECT }
      )

      await this.callback()
    })
  }
}

export default WithSyncLockService
