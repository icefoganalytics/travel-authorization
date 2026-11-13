import Big from "big.js"

import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

const MAX_AMOUNT = new Big("999999999999999.999")
const AMOUNT_PATTERN = /^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,3})?$/

export class CalculateTotalService extends BaseService {
  constructor(protected items: { grossAmount: string; saleType: "Sale" | "Refund" | "Void" }[]) {
    super()
  }

  perform(): string {
    let total = new Big("0")

    for (const item of this.items) {
      const amount = this.parseAmount(item.grossAmount)

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

  private parseAmount(amount: string): Big {
    if (!AMOUNT_PATTERN.test(amount)) {
      throw new InvoiceValidationError(
        "Amount must have at most 15 integral digits and 3 decimals."
      )
    }

    return new Big(amount)
  }
}

export default CalculateTotalService
