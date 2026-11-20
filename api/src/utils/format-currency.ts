import { isNil } from "lodash"

export function formatCurrency(amount: number | null | undefined): string {
  if (isNil(amount)) {
    return ""
  }

  if (amount > 1) {
    return currencyFormatter.format(amount)
  }

  return smallAmountCurrencyFormatter.format(amount)
}

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const smallAmountCurrencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

export default formatCurrency
