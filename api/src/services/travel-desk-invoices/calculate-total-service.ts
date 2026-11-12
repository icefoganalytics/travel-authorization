import amountToThousandths from "@/utils/amount-to-thousandths"
import thousandthsToAmount from "@/utils/thousandths-to-amount"

import BaseService from "@/services/base-service"

export class CalculateTotalService extends BaseService {
  constructor(protected items: { grossAmount: string; saleType: "Sale" | "Refund" | "Void" }[]) {
    super()
  }

  perform(): string {
    let total = 0n

    for (const item of this.items) {
      const amount = amountToThousandths(item.grossAmount)

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

    return thousandthsToAmount(total)
  }
}

export default CalculateTotalService
