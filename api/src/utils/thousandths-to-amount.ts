import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

const MAX_AMOUNT_THOUSANDTHS = 999999999999999999n

export function thousandthsToAmount(amount: bigint): string {
  if (amount > MAX_AMOUNT_THOUSANDTHS || amount < -MAX_AMOUNT_THOUSANDTHS) {
    throw new InvoiceValidationError("Invoice total exceeds the supported range.")
  }

  const isNegative = amount < 0n
  const absoluteAmount = isNegative ? -amount : amount
  const integralPart = absoluteAmount / 1000n
  const fractionalPart = (absoluteAmount % 1000n).toString().padStart(3, "0")

  return `${isNegative ? "-" : ""}${integralPart}.${fractionalPart}`
}

export default thousandthsToAmount
