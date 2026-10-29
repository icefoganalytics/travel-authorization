const MAX_AMOUNT_THOUSANDTHS = 999999999999999999n
const AMOUNT_PATTERN = /^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,3})?$/

export class InvoiceValidationError extends Error {}

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

export function calculateInvoiceTotal(
  items: { grossAmount: string; saleType: "Sale" | "Refund" | "Void" }[]
): string {
  let total = 0n

  for (const item of items) {
    const amount = amountToThousandths(item.grossAmount)

    if (item.saleType === "Refund") {
      total -= amount < 0n ? -amount : amount
      continue
    }

    if (item.saleType === "Sale") total += amount
  }

  return thousandthsToAmount(total)
}

export default calculateInvoiceTotal
