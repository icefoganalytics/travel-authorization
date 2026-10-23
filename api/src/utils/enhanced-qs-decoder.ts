import qs from "qs"

const MAX_QUERY_ARRAY_LENGTH = 1000
const MAX_QUERY_PARAMETER_COUNT = 1500

export function enhancedQsDecoder(params: string) {
  return qs.parse(params, {
    arrayLimit: MAX_QUERY_ARRAY_LENGTH,
    parameterLimit: MAX_QUERY_PARAMETER_COUNT,
    throwOnLimitExceeded: true,
    strictNullHandling: true,
    decoder(str, defaultDecoder, charset, type) {
      if (type === "value") {
        if (str === "true") return true
        if (str === "false") return false
      }

      return defaultDecoder(str, defaultDecoder, charset)
    },
  })
}

export default enhancedQsDecoder
