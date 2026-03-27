import { formatDate } from "./format-date"

export function formatDateTime(
  date: string | null | undefined,
  format = "MMM dd yyyy, HH:mm"
): string {
  return formatDate(date, format)
}

export default formatDateTime
