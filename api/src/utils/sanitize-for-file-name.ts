export function sanitizeForFileName(input: string): string {
  return input
    .normalize("NFKD") // break accents
    .replace(/[^\w\s\-.,]/g, "") // keep only word chars, space, dash, underscore, dot, comma
    .replace(/\s+/g, " ") // collapse spaces
    .trim()
}

export default sanitizeForFileName
