import { isUndefined } from "lodash"

/**
 * Extracts the pathname from a URL string.
 * Handles both absolute URLs (e.g., "http://localhost:3000/api/path") and
 * relative URLs (e.g., "/api/path").
 */
export function URLToPathName(url: string | undefined): string | undefined {
  if (isUndefined(url)) return url

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname
  } catch {
    // If URL parsing fails, it's a relative URL, return as-is
    return url
  }
}

export default URLToPathName
