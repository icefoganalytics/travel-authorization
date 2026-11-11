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

      if (item.saleType === "Refund") {
        total -= amount < 0n ? -amount : amount
        continue
      }

      if (item.saleType === "Sale") total += amount
    }

    return thousandthsToAmount(total)
  }
}

export default CalculateTotalService
