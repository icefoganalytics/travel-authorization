export function nullIfEmpty<T>(value: T): T | null {
  if (value) return value
  return null
}
