export function parsePossiblyDoubleEncodedJson<T>(data: unknown): T {
  if (typeof data !== "string") return data as T

  let parsed: unknown = data
  try {
    parsed = JSON.parse(data)
  } catch {
    return data as T
  }

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      // swallow; leave as string
    }
  }

  return parsed as T
}

export default parsePossiblyDoubleEncodedJson
