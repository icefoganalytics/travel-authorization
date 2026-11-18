import Big from "big.js"

import { type TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { normalizeInvoiceAmount } from "@/utils/normalize-invoice-amount"

const MAX_AMOUNT = new Big("999999999999999.999")

export class CalculateTotalService extends BaseService {
  constructor(protected items: Pick<TravelDeskInvoiceItem, "grossAmount" | "saleType">[]) {
    super()
  }

  perform(): string {
    let total = new Big("0")

    for (const item of this.items) {
      const normalizedAmount = normalizeInvoiceAmount(item.grossAmount)
      const amount = new Big(normalizedAmount)

      switch (item.saleType) {
        case "refund":
          total = total.minus(amount.abs())
          break
        case "sale":
          total = total.plus(amount)
          break
        case "void":
          break
      }
    }

    if (total.abs().gt(MAX_AMOUNT)) {
      throw new InvoiceValidationError("Invoice total exceeds the supported range.")
    }

    return total.toFixed(3)
  }
}

export default CalculateTotalService
