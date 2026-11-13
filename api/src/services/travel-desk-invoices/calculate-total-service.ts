import BaseService from "@/services/base-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

const MAX_AMOUNT_THOUSANDTHS = 999999999999999999n
const AMOUNT_PATTERN = /^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,3})?$/

export class CalculateTotalService extends BaseService {
  constructor(protected items: { grossAmount: string; saleType: "Sale" | "Refund" | "Void" }[]) {
    super()
  }

  perform(): string {
    let total = 0n

    for (const item of this.items) {
      const amount = this.parseAmountToThousandths(item.grossAmount)

      switch (item.saleType) {
        case "Refund":
          total -= amount < 0n ? -amount : amount
          break
        case "Sale":
          total += amount
          break
        case "Void":
          break
      }
    }

    return this.formatThousandthsAsAmount(total)
  }

  private parseAmountToThousandths(amount: string): bigint {
    if (!AMOUNT_PATTERN.test(amount)) {
      throw new InvoiceValidationError(
        "Amount must have at most 15 integral digits and 3 decimals."
      )
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

  private formatThousandthsAsAmount(amount: bigint): string {
    if (amount > MAX_AMOUNT_THOUSANDTHS || amount < -MAX_AMOUNT_THOUSANDTHS) {
      throw new InvoiceValidationError("Invoice total exceeds the supported range.")
    }

    const isNegative = amount < 0n
    const absoluteAmount = isNegative ? -amount : amount
    const integralPart = absoluteAmount / 1000n
    const fractionalPart = (absoluteAmount % 1000n).toString().padStart(3, "0")

    return `${isNegative ? "-" : ""}${integralPart}.${fractionalPart}`
  }
}

export default CalculateTotalService
