import Big from "big.js"

import ServiceValidationError from "@/services/service-validation-error"

export function normalizeInvoiceAmount(amount: string): string {
  if (!/^-?\d+(?:\.\d+)?$/.test(amount)) {
    throw new ServiceValidationError("Amount must be a decimal number.")
  }

  const roundedAmount = new Big(amount).round(3, Big.roundHalfUp)
  if (roundedAmount.abs().gt("999999999999999.999")) {
    throw new ServiceValidationError("Amount exceeds the supported range.")
  }

  return roundedAmount.toFixed(3)
}

export default normalizeInvoiceAmount
