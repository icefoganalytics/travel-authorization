import { type Transaction } from "@sequelize/core"
import { isNil } from "lodash"

import db, { TravelDeskInvoice } from "@/models"

import ServiceValidationError from "@/services/service-validation-error"

// Lock the invoice before touching its items, so deletion waits for an overlapping update.
export function withTravelDeskInvoiceLock<Result>(
  travelDeskInvoiceOrId: TravelDeskInvoice | number,
  callback: (travelDeskInvoice: TravelDeskInvoice, transaction: Transaction) => Promise<Result>
): Promise<Result> {
  return db.transaction(async (transaction) => {
    const lockOptions = {
      lock: transaction.LOCK.UPDATE,
      transaction,
    }

    if (typeof travelDeskInvoiceOrId !== "number") {
      // Deletion reloads the supplied instance without locking any preloaded items.
      const travelDeskInvoice = await travelDeskInvoiceOrId.reload({
        ...lockOptions,
        include: [],
      })
      return callback(travelDeskInvoice, transaction)
    }

    const travelDeskInvoice = await TravelDeskInvoice.findByPk(travelDeskInvoiceOrId, lockOptions)
    if (isNil(travelDeskInvoice)) {
      throw new ServiceValidationError("Invoice does not exist.")
    }

    return callback(travelDeskInvoice, transaction)
  })
}

export default withTravelDeskInvoiceLock
