import { isNil } from "lodash"

export function formatCurrency(
  amount: number | null | undefined,
  currency = "CAD",
  options: Intl.NumberFormatOptions = {}
): string {
  if (isNil(amount)) {
    return ""
  }

  const minimumFractionDigits = amount > 1 ? 2 : 3
  const maximumFractionDigits = amount > 1 ? 2 : 3
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    ...options,
  })
  return formatter.format(amount)
}

export default formatCurrency
