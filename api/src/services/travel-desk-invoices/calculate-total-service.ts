import Big from "big.js"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"
import { normalizeInvoiceAmount } from "@/utils/normalize-invoice-amount"

const MAX_AMOUNT = new Big("999999999999999.999")

export class CalculateTotalService extends BaseService {
  constructor(protected items: { grossAmount: string; saleType: "Sale" | "Refund" | "Void" }[]) {
    super()
  }

  perform(): string {
    let total = new Big("0")

    for (const item of this.items) {
      const normalizedAmount = normalizeInvoiceAmount(item.grossAmount)
      const amount = new Big(normalizedAmount)

      switch (item.saleType) {
        case "Refund":
          total = total.minus(amount.abs())
          break
        case "Sale":
          total = total.plus(amount)
          break
        case "Void":
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
