import { isNil } from "lodash"

// Legacy city values include a province suffix, for example "Whitehorse (YT)".
const PROVINCE_SUFFIX_PATTERN = /\(([^()]+)\)$/

export function extractProvinceFromCity(city: string): string | undefined {
  const provinceMatch = city.match(PROVINCE_SUFFIX_PATTERN)
  if (isNil(provinceMatch)) return undefined

  const province = provinceMatch[1]
  return province
}

export default extractProvinceFromCity
