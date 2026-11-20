import { type Transaction } from "@sequelize/core"
import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoice } from "@/models"

import TravelDeskInvoiceValidationError from "@/services/travel-desk-invoices/invoice-validation-error"

// Lock the invoice before touching its items, so deletion waits for an overlapping update.
export function withInvoiceLock<Result>(
  invoiceOrId: TravelDeskInvoice | number,
  callback: (invoice: TravelDeskInvoice, transaction: Transaction) => Promise<Result>
): Promise<Result> {
  return db.transaction(async (transaction) => {
    const lockOptions = {
      lock: transaction.LOCK.UPDATE,
      transaction,
    }

    if (typeof invoiceOrId !== "number") {
      // Deletion reloads the supplied instance without locking any preloaded items.
      const invoice = await invoiceOrId.reload({
        ...lockOptions,
        include: [],
      })
      return callback(invoice, transaction)
    }

    const invoice = await TravelDeskInvoice.findByPk(invoiceOrId, lockOptions)
    if (isNil(invoice)) {
      throw new TravelDeskInvoiceValidationError("Invoice does not exist.")
    }

    return callback(invoice, transaction)
  })
}

export default withInvoiceLock
