import Big from "big.js"

import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

export function normalizeInvoiceAmount(amount: string): string {
  if (!/^-?\d+(?:\.\d+)?$/.test(amount)) {
    throw new InvoiceValidationError("Amount must be a decimal number.")
  }

  const roundedAmount = new Big(amount).round(3, Big.roundHalfUp)
  if (roundedAmount.abs().gt("999999999999999.999")) {
    throw new InvoiceValidationError("Amount exceeds the supported range.")
  }

  return roundedAmount.toFixed(3)
}
