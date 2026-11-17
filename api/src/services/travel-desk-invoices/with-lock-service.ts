import { db } from "@/db/db-client"

import { TravelDeskInvoice } from "@/models"

import BaseService from "@/services/base-service"

/**
 * Runs the callback in a transaction while holding an update lock on the invoice.
 * Invoice updates acquire the same row lock before replacing items, so deletion
 * waits for an overlapping update before removing its replacement items.
 */
export class WithLockService extends BaseService {
  constructor(
    protected invoice: TravelDeskInvoice,
    protected callback: () => Promise<void>
  ) {
    super()
  }

  async perform(): Promise<void> {
    await db.transaction(async (transaction) => {
      // Lock only the invoice row, without reloading its previously included items.
      await this.invoice.reload({
        include: [],
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      await this.callback()
    })
  }
}

export default WithLockService
