import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

const MAX_AMOUNT_THOUSANDTHS = 999999999999999999n
const AMOUNT_PATTERN = /^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,3})?$/

export function amountToThousandths(amount: string): bigint {
  if (!AMOUNT_PATTERN.test(amount)) {
    throw new InvoiceValidationError("Amount must have at most 15 integral digits and 3 decimals.")
  }

  const isNegative = amount.startsWith("-")
  const unsignedAmount = isNegative ? amount.slice(1) : amount
  const [integralPart, fractionalPart = ""] = unsignedAmount.split(".")
  const thousandths = BigInt(integralPart) * 1000n + BigInt(fractionalPart.padEnd(3, "0"))
  const signedThousandths = isNegative ? -thousandths : thousandths

  if (signedThousandths > MAX_AMOUNT_THOUSANDTHS || signedThousandths < -MAX_AMOUNT_THOUSANDTHS) {
    throw new InvoiceValidationError("Amount exceeds the supported range.")
  }

  return signedThousandths
}

export default amountToThousandths
